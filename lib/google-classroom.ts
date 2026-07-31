import { JWT, OAuth2Client } from 'google-auth-library';
import type { SupabaseClient } from '@supabase/supabase-js';

// ─────────────────────────────────────────────────────────────────────────────
// Google Classroom roster automation.
//
// When a course enrollment is paid, the student is added to the Google
// Classroom attached to that course:
//   1. Try a direct roster add  (works when teacher + student share a domain)
//   2. Fall back to an e-mail invitation (required for external students —
//      Google requires their consent; they click "Join" in the invite mail)
//
// Two auth setups are supported — see GOOGLE-CLASSROOM-SETUP.md:
//   A) Workspace service account + domain-wide delegation (recommended)
//      GOOGLE_SERVICE_ACCOUNT_KEY + GOOGLE_CLASSROOM_TEACHER_EMAIL
//   B) Personal Gmail teacher account + OAuth refresh token (quick start)
//      GOOGLE_OAUTH_CLIENT_ID / _SECRET / _REFRESH_TOKEN
//   C) Google Apps Script relay (NO Google Cloud Console at all) — a tiny
//      script.deployed under the teacher Gmail acts as our roster API:
//      GOOGLE_CLASSROOM_RELAY_URL + GOOGLE_CLASSROOM_RELAY_SECRET
// ─────────────────────────────────────────────────────────────────────────────

export type ClassroomInviteStatus =
  | 'enrolled'          // added straight onto the roster
  | 'invited'           // invitation e-mail sent, student must accept
  | 'already_enrolled'  // was already on the roster
  | 'already_invited'   // a pending invitation already exists
  | 'failed';           // invite attempt failed — safe to retry (admin endpoint)

const VALID_STATUSES: ClassroomInviteStatus[] = [
  'enrolled',
  'invited',
  'already_enrolled',
  'already_invited',
];

const ROSTER_SCOPE = 'https://www.googleapis.com/auth/classroom.rosters';
const CLASSROOM_API = 'https://classroom.googleapis.com/v1';

export function isClassroomConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_CLASSROOM_RELAY_URL ||
      process.env.GOOGLE_SERVICE_ACCOUNT_KEY ||
      process.env.GOOGLE_OAUTH_CLIENT_ID,
  );
}

/**
 * Transport C: call the Apps Script relay instead of Google directly.
 * Google answers web-app calls with a 302 that turns our POST into a GET and
 * drops the body — so parameters travel in the query string (the script reads
 * e.parameter, which is populated from the query string on both methods).
 * Apps Script always answers HTTP 200; errors come back in the JSON body.
 */
async function addStudentViaRelay(
  classroomCourseId: string,
  studentEmail: string,
): Promise<ClassroomInviteStatus> {
  const secret = process.env.GOOGLE_CLASSROOM_RELAY_SECRET;
  if (!secret) {
    throw new Error('GOOGLE_CLASSROOM_RELAY_SECRET is required with a relay URL.');
  }
  const url = new URL(process.env.GOOGLE_CLASSROOM_RELAY_URL!);
  url.searchParams.set('secret', secret);
  url.searchParams.set('courseId', classroomCourseId);
  url.searchParams.set('email', studentEmail);

  const response = await fetch(url, { method: 'POST', redirect: 'follow' });
  const data = (await response.json().catch(() => null)) as {
    status?: string;
    error?: string;
  } | null;

  if (!data) {
    throw new Error(`Classroom relay returned an unreadable response (HTTP ${response.status}).`);
  }
  if (data.error) {
    throw new Error(`Classroom relay: ${data.error.slice(0, 300)}`);
  }
  if (!data.status || !VALID_STATUSES.includes(data.status as ClassroomInviteStatus)) {
    throw new Error(`Classroom relay returned an unknown status: ${String(data.status)}`);
  }
  return data.status as ClassroomInviteStatus;
}

async function getAccessToken(): Promise<string> {
  // Path A — service account impersonating the Workspace teacher account.
  const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (serviceAccountJson) {
    const teacherEmail = process.env.GOOGLE_CLASSROOM_TEACHER_EMAIL;
    if (!teacherEmail) {
      throw new Error('GOOGLE_CLASSROOM_TEACHER_EMAIL is required with a service account.');
    }
    const credentials = JSON.parse(serviceAccountJson) as {
      client_email?: string;
      private_key?: string;
    };
    if (!credentials.client_email || !credentials.private_key) {
      throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY is not a valid service account JSON.');
    }
    const jwt = new JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: [ROSTER_SCOPE],
      subject: teacherEmail, // domain-wide delegation: act as the teacher
    });
    const { token } = await jwt.getAccessToken();
    if (!token) throw new Error('Google did not return an access token (service account).');
    return token;
  }

  // Path B — OAuth refresh token for a personal Gmail teacher account.
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_OAUTH_REFRESH_TOKEN;
  if (clientId && clientSecret && refreshToken) {
    const oauth = new OAuth2Client(clientId, clientSecret);
    oauth.setCredentials({ refresh_token: refreshToken });
    const { token } = await oauth.getAccessToken();
    if (!token) throw new Error('Google did not return an access token (refresh token).');
    return token;
  }

  throw new Error(
    'Google Classroom is not configured — set service-account or OAuth env vars (see GOOGLE-CLASSROOM-SETUP.md).',
  );
}

async function classroomFetch(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const token = await getAccessToken();
  return fetch(`${CLASSROOM_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });
}

/**
 * Add a student to a class. Direct roster add first; if Google insists on
 * consent (external students), create an invitation they accept by e-mail.
 * Uses the Apps Script relay when configured (no Google Cloud needed).
 */
export async function addStudentToClass(
  classroomCourseId: string,
  studentEmail: string,
): Promise<ClassroomInviteStatus> {
  if (process.env.GOOGLE_CLASSROOM_RELAY_URL) {
    return addStudentViaRelay(classroomCourseId, studentEmail);
  }

  const roster = await classroomFetch(`/courses/${classroomCourseId}/students`, {
    method: 'POST',
    body: JSON.stringify({ userId: studentEmail }),
  });

  if (roster.ok) return 'enrolled';
  if (roster.status === 409) return 'already_enrolled';

  if (roster.status === 400 || roster.status === 403) {
    const invitation = await classroomFetch('/invitations', {
      method: 'POST',
      body: JSON.stringify({
        courseId: classroomCourseId,
        userId: studentEmail,
        role: 'STUDENT',
      }),
    });
    if (invitation.ok) return 'invited';
    if (invitation.status === 409) return 'already_invited';

    const detail = await invitation.text();
    throw new Error(`Google invitation failed (${invitation.status}): ${detail.slice(0, 300)}`);
  }

  const detail = await roster.text();
  throw new Error(`Google roster add failed (${roster.status}): ${detail.slice(0, 300)}`);
}

/**
 * Which Google Classroom does a course belong to? Read from the
 * courses.classroom_course_id column (after supabase/classroom.sql runs).
 * Fallback: GOOGLE_CLASSROOM_COURSE_MAP env JSON, e.g. {"1":"731234567890"}
 * so Classroom links work before/without the migration.
 */
export async function resolveClassroomCourseId(
  db: SupabaseClient,
  courseid: number,
): Promise<string | null> {
  const { data, error } = await db
    .from('courses')
    .select('classroom_course_id')
    .eq('courseid', courseid)
    .maybeSingle();

  const columnMissing =
    !!error &&
    (error.code === '42703' ||
      error.code === 'PGRST204' ||
      /classroom_course_id/i.test(error.message ?? ''));

  if (!error) {
    const id = (data as { classroom_course_id?: string | null } | null)?.classroom_course_id;
    if (id) return id;
  } else if (!columnMissing) {
    throw new Error(error.message);
  }

  const mapJson = process.env.GOOGLE_CLASSROOM_COURSE_MAP;
  if (!mapJson) return null;
  try {
    const map = JSON.parse(mapJson) as Record<string, string>;
    return map[String(courseid)] ?? null;
  } catch {
    console.error('GOOGLE_CLASSROOM_COURSE_MAP is not valid JSON');
    return null;
  }
}

/**
 * Persist the invite outcome on the enrollment row (after
 * supabase/classroom.sql runs). Missing columns pre-migration are ignored.
 */
export async function recordInviteOutcome(
  db: SupabaseClient,
  userId: string,
  courseid: number,
  status: ClassroomInviteStatus | null,
  errorMessage: string | null,
): Promise<void> {
  const { error } = await db
    .from('enrollments')
    .update({
      classroom_invite_status: status,
      classroom_invite_error: errorMessage,
      classroom_invited_at: status ? new Date().toISOString() : null,
    })
    .eq('user_id', userId)
    .eq('courseid', courseid);

  if (error && !/classroom_invite/i.test(error.message ?? '')) {
    console.error('recordInviteOutcome failed:', error.message);
  }
}
