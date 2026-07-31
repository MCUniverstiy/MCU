import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import {
  addStudentToClass,
  isClassroomConfigured,
  recordInviteOutcome,
  resolveClassroomCourseId,
} from '@/lib/google-classroom';

// Admin-only: (re)send a student's Google Classroom invite for an enrollment.
// Used to retry failed invites — and to test the integration without buying
// a course again.
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const enrollmentid = Number(body?.enrollmentid);
    if (!Number.isFinite(enrollmentid)) {
      return NextResponse.json({ error: 'enrollmentid is required.' }, { status: 400 });
    }

    // Caller must be a signed-in admin.
    const authClient = await createClient();
    const {
      data: { user },
    } = await authClient.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
    }

    const db = createServiceClient();
    const { data: caller } = await db
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .maybeSingle();
    if (!caller?.is_admin) {
      return NextResponse.json({ error: 'Admins only.' }, { status: 403 });
    }

    if (!isClassroomConfigured()) {
      return NextResponse.json(
        { error: 'Google Classroom is not configured — set the env vars (see GOOGLE-CLASSROOM-SETUP.md).' },
        { status: 500 },
      );
    }

    const { data: enrollment, error: enrollmentError } = await db
      .from('enrollments')
      .select('enrollmentid, user_id, courseid')
      .eq('enrollmentid', enrollmentid)
      .maybeSingle();

    if (enrollmentError || !enrollment) {
      return NextResponse.json({ error: 'Enrollment not found.' }, { status: 404 });
    }

    const classroomCourseId = await resolveClassroomCourseId(db, enrollment.courseid);
    if (!classroomCourseId) {
      return NextResponse.json(
        { error: `Course ${enrollment.courseid} is not linked to a Google Classroom — set courses.classroom_course_id (or GOOGLE_CLASSROOM_COURSE_MAP).` },
        { status: 404 },
      );
    }

    const { data: student } = await db
      .from('users')
      .select('email')
      .eq('id', enrollment.user_id)
      .maybeSingle();

    if (!student?.email) {
      return NextResponse.json({ error: 'Student has no email on file.' }, { status: 404 });
    }

    try {
      const status = await addStudentToClass(classroomCourseId, student.email);
      await recordInviteOutcome(db, enrollment.user_id, enrollment.courseid, status, null);
      return NextResponse.json({ status, email: student.email, classroomCourseId });
    } catch (inviteError) {
      const message = inviteError instanceof Error ? inviteError.message : 'Invite failed';
      await recordInviteOutcome(db, enrollment.user_id, enrollment.courseid, 'failed', String(message).slice(0, 500));
      return NextResponse.json({ error: message }, { status: 502 });
    }
  } catch (err) {
    console.error('classroom-invite failed:', err);
    const message = err instanceof Error ? err.message : 'Unexpected error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
