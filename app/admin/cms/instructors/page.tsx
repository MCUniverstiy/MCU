'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import SiteLayout from '@/components/SiteLayout';
import AdminGuard from '@/components/AdminGuard';
import { createClient } from '@/lib/supabase/client';

type InstructorRow = {
  instructorid: number;
  firstname: string;
  lastname: string;
  specialization: string | null;
  bio: string | null;
  photo_url: string | null;
};

type InstructorForm = {
  instructorid: number;
  firstname: string;
  lastname: string;
  specialization: string;
  bio: string;
  photo_url: string;
};

type TeachingCourse = {
  courseid: number;
  coursename: string;
  instructorid: number | null;
};

function blankInstructor(): InstructorForm {
  return {
    instructorid: 0,
    firstname: '',
    lastname: '',
    specialization: '',
    bio: '',
    photo_url: '',
  };
}

function toForm(row: InstructorRow): InstructorForm {
  return {
    instructorid: row.instructorid,
    firstname: row.firstname || '',
    lastname: row.lastname || '',
    specialization: row.specialization || '',
    bio: row.bio || '',
    photo_url: row.photo_url || '',
  };
}

function fullName(row: Pick<InstructorRow, 'firstname' | 'lastname'>) {
  return `${row.firstname || ''} ${row.lastname || ''}`.trim() || 'Unnamed instructor';
}

function initials(row: Pick<InstructorRow, 'firstname' | 'lastname'>) {
  return `${row.firstname?.[0] || ''}${row.lastname?.[0] || ''}`.toUpperCase() || '?';
}

function schemaHint(message: string) {
  return /bio|photo_url|specialization|instructors/i.test(message) && /column|schema cache|does not exist/i.test(message)
    ? ' The instructor profile fields are not ready yet — run supabase/cms.sql in the Supabase SQL Editor, then reload this page.'
    : '';
}

export default function InstructorsCMSPage() {
  const db = useMemo(() => createClient(), []);
  const [rows, setRows] = useState<InstructorRow[]>([]);
  const [courses, setCourses] = useState<TeachingCourse[]>([]);
  const [edit, setEdit] = useState<InstructorForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const [instructorsResult, coursesResult] = await Promise.all([
      db
        .from('instructors')
        .select('instructorid, firstname, lastname, specialization, bio, photo_url')
        .order('lastname', { ascending: true })
        .order('firstname', { ascending: true }),
      db.from('courses').select('courseid, coursename, instructorid').order('coursename'),
    ]);

    if (instructorsResult.error) {
      setError(`Could not load instructors. (${instructorsResult.error.message})${schemaHint(instructorsResult.error.message)}`);
      setRows([]);
    } else {
      setError('');
      setRows((instructorsResult.data || []) as InstructorRow[]);
      setCourses((coursesResult.data || []) as TeachingCourse[]);
    }
    setLoading(false);
  }, [db]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const teachingByInstructor = useMemo(() => {
    const map = new Map<number, TeachingCourse[]>();
    for (const course of courses) {
      if (course.instructorid === null) continue;
      const list = map.get(course.instructorid) || [];
      list.push(course);
      map.set(course.instructorid, list);
    }
    return map;
  }, [courses]);

  function startNew() {
    setError('');
    setNotice('');
    setEdit(blankInstructor());
  }

  function startEdit(row: InstructorRow) {
    setError('');
    setNotice('');
    setEdit(toForm(row));
  }

  async function upload(file: File) {
    if (!edit) return;
    setUploading(true);
    setError('');
    const path = `instructors/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '-')}`;
    const { error: uploadError } = await db.storage.from('cms').upload(path, file);
    if (uploadError) {
      setError(`Photo upload failed: ${uploadError.message}`);
    } else {
      const { data } = db.storage.from('cms').getPublicUrl(path);
      setEdit({ ...edit, photo_url: data.publicUrl });
    }
    setUploading(false);
  }

  async function save() {
    if (!edit) return;

    const firstname = edit.firstname.trim();
    const lastname = edit.lastname.trim();

    if (!firstname || !lastname) {
      setError('First name and last name are required.');
      return;
    }

    setBusy(true);
    setError('');
    setNotice('');

    const payload = {
      firstname,
      lastname,
      specialization: edit.specialization.trim() || null,
      bio: edit.bio.trim() || null,
      photo_url: edit.photo_url.trim() || null,
    };

    const result = edit.instructorid
      ? await db.from('instructors').update(payload).eq('instructorid', edit.instructorid)
      : await db.from('instructors').insert(payload);

    if (result.error) {
      setError(`${result.error.message}${schemaHint(result.error.message)}`);
    } else {
      setEdit(null);
      setNotice('Instructor saved.');
      await load();
    }
    setBusy(false);
  }

  async function remove(row: InstructorRow) {
    const count = teachingByInstructor.get(row.instructorid)?.length || 0;
    const suffix = count
      ? ` ${count === 1 ? 'The course they teach' : `The ${count} courses they teach`} will stay published but show no instructor.`
      : '';
    if (!window.confirm(`Delete “${fullName(row)}”?${suffix}`)) return;

    setBusy(true);
    setError('');
    const { error: deleteError } = await db.from('instructors').delete().eq('instructorid', row.instructorid);
    if (deleteError) setError(deleteError.message);
    else {
      setNotice('Instructor deleted.');
      if (edit?.instructorid === row.instructorid) setEdit(null);
      await load();
    }
    setBusy(false);
  }

  return (
    <AdminGuard>
      <SiteLayout>
        <main style={{ padding: '130px 24px 80px', background: '#F8F8FA', minHeight: '80vh' }}>
          <div className="container">
            <Link href="/admin/cms" style={{ color: '#7B1A2D', fontWeight: 600 }}>
              ← Back to Content Manager
            </Link>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 20, flexWrap: 'wrap', marginTop: 18 }}>
              <div>
                <p style={{ color: '#7B1A2D', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  Teaching team
                </p>
                <h1 style={{ marginTop: 6, color: '#1A1A2A' }}>Instructors</h1>
                <p style={{ color: '#666', marginTop: 8, maxWidth: 680, lineHeight: 1.6 }}>
                  Add instructors, their specialisations, bios and profile photos. Assign an instructor to a course from
                  the Courses manager — the name appears on the public courses page.
                </p>
              </div>
              <button type="button" onClick={startNew} style={buttonStyle}>+ Add instructor</button>
            </div>

            <div style={{ marginTop: 20, padding: '14px 18px', borderRadius: 12, background: 'rgba(46,196,182,0.10)', border: '1px solid rgba(46,196,182,0.28)', color: '#355', fontSize: 13, lineHeight: 1.6 }}>
              Tip: to put an instructor on a course, open <Link href="/admin/cms/courses" style={{ color: '#245c57', fontWeight: 700 }}>Content Manager → Courses</Link>, edit the course and pick them in the Instructor dropdown.
            </div>

            {error && <div role="alert" style={alertStyle}>{error}</div>}
            {notice && <div role="status" style={noticeStyle}>{notice}</div>}

            <div style={{ display: 'grid', gridTemplateColumns: edit ? 'minmax(0, 1fr) 400px' : '1fr', gap: 24, marginTop: 24, alignItems: 'start' }}>
              <section style={panelStyle}>
                {loading ? (
                  <p style={{ color: '#888' }}>Loading instructors…</p>
                ) : rows.length === 0 ? (
                  <p style={{ color: '#888' }}>No instructors found. Add one to get started.</p>
                ) : (
                  rows.map((row) => {
                    const teaching = teachingByInstructor.get(row.instructorid) || [];
                    return (
                      <article key={row.instructorid} style={{ display: 'flex', gap: 16, alignItems: 'center', padding: '18px 0', borderBottom: '1px solid #eee' }}>
                        {row.photo_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={row.photo_url} alt={fullName(row)} style={{ width: 58, height: 58, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                        ) : (
                          <div style={{ width: 58, height: 58, borderRadius: '50%', background: '#7B1A2D', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18, flexShrink: 0 }}>
                            {initials(row)}
                          </div>
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                            <strong style={{ color: '#1A1A2A' }}>{fullName(row)}</strong>
                            <span style={statusBadge('#245c57')}>
                              {teaching.length === 0 ? 'No courses' : `${teaching.length} course${teaching.length === 1 ? '' : 's'}`}
                            </span>
                          </div>
                          <div style={{ color: '#666', fontSize: 13, marginTop: 6 }}>
                            {row.specialization || 'Specialisation not set'}
                          </div>
                          <small style={{ color: '#999' }}>
                            {teaching.length ? `Teaching: ${teaching.map((course) => course.coursename).join(', ')}` : (row.bio || 'No bio yet')}
                          </small>
                        </div>
                        <button type="button" onClick={() => startEdit(row)} style={smallButton}>Edit</button>
                        <button type="button" onClick={() => remove(row)} disabled={busy} style={{ ...smallButton, color: '#A32B2B' }}>Delete</button>
                      </article>
                    );
                  })
                )}
              </section>

              {edit && (
                <aside style={panelStyle}>
                  <h2 style={{ color: '#1A1A2A', fontSize: 22 }}>{edit.instructorid ? 'Edit instructor' : 'Add instructor'}</h2>
                  <p style={{ color: '#777', fontSize: 13, lineHeight: 1.5, margin: '8px 0 18px' }}>
                    Names appear on course cards as “Instructor: Firstname Lastname”.
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <label style={labelStyle}>
                      First name *
                      <input value={edit.firstname} onChange={(event) => setEdit({ ...edit, firstname: event.target.value })} style={inputStyle} placeholder="Dr. Alexander" />
                    </label>
                    <label style={labelStyle}>
                      Last name *
                      <input value={edit.lastname} onChange={(event) => setEdit({ ...edit, lastname: event.target.value })} style={inputStyle} placeholder="Wong" />
                    </label>
                  </div>

                  <label style={labelStyle}>
                    Specialisation
                    <input value={edit.specialization} onChange={(event) => setEdit({ ...edit, specialization: event.target.value })} style={inputStyle} placeholder="Wealth Planning & Estate Tax" />
                  </label>
                  <label style={labelStyle}>
                    Bio
                    <textarea rows={5} value={edit.bio} onChange={(event) => setEdit({ ...edit, bio: event.target.value })} style={inputStyle} placeholder="Short background, credentials and teaching focus." />
                  </label>

                  <label style={labelStyle}>
                    Profile photo
                    <input type="file" accept="image/*" disabled={uploading} onChange={(event) => event.target.files && upload(event.target.files[0])} style={{ ...inputStyle, padding: 8 }} />
                  </label>
                  {uploading && <p style={{ color: '#777', fontSize: 13, margin: '-6px 0 12px' }}>Uploading photo…</p>}
                  {edit.photo_url && (
                    <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 14 }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={edit.photo_url} alt="Profile preview" style={{ width: '100%', maxWidth: 180, height: 110, objectFit: 'cover', borderRadius: 10 }} />
                      <button type="button" onClick={() => setEdit({ ...edit, photo_url: '' })} style={{ ...smallButton, color: '#A32B2B' }}>Remove photo</button>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                    <button type="button" onClick={save} disabled={busy || uploading} style={{ ...buttonStyle, opacity: busy || uploading ? 0.6 : 1 }}>
                      {busy ? 'Saving…' : 'Save instructor'}
                    </button>
                    <button type="button" onClick={() => setEdit(null)} style={smallButton}>Cancel</button>
                  </div>
                </aside>
              )}
            </div>
          </div>
        </main>
      </SiteLayout>
    </AdminGuard>
  );
}

const panelStyle: React.CSSProperties = {
  background: '#fff',
  borderRadius: 16,
  padding: 22,
  border: '1px solid #eee',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  color: '#444',
  fontWeight: 600,
  fontSize: 13,
  marginBottom: 14,
};

const inputStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  padding: '10px 12px',
  marginTop: 6,
  border: '1px solid #d9d9df',
  borderRadius: 8,
  background: '#fff',
  color: '#1A1A2A',
  font: 'inherit',
};

const buttonStyle: React.CSSProperties = {
  border: 0,
  borderRadius: 24,
  padding: '11px 18px',
  background: '#7B1A2D',
  color: '#fff',
  fontWeight: 700,
  cursor: 'pointer',
};

const smallButton: React.CSSProperties = {
  border: 0,
  background: 'transparent',
  color: '#7B1A2D',
  fontWeight: 700,
  cursor: 'pointer',
  padding: 8,
  whiteSpace: 'nowrap',
};

const alertStyle: React.CSSProperties = {
  marginTop: 18,
  padding: '12px 16px',
  borderRadius: 10,
  background: 'rgba(196, 30, 58, 0.08)',
  border: '1px solid rgba(196, 30, 58, 0.25)',
  color: '#8A1C1C',
  fontSize: 13,
  lineHeight: 1.5,
};

const noticeStyle: React.CSSProperties = {
  marginTop: 18,
  padding: '12px 16px',
  borderRadius: 10,
  background: 'rgba(46, 196, 182, 0.10)',
  border: '1px solid rgba(46, 196, 182, 0.3)',
  color: '#245c57',
  fontSize: 13,
};

function statusBadge(color: string): React.CSSProperties {
  return {
    fontSize: 10,
    fontWeight: 700,
    color,
    background: `${color}18`,
    padding: '3px 8px',
    borderRadius: 20,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  };
}
