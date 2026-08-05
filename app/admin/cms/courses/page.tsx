'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import SiteLayout from '@/components/SiteLayout';
import AdminGuard from '@/components/AdminGuard';
import { createClient } from '@/lib/supabase/client';

type CourseRow = {
  courseid: number;
  coursename: string;
  coursetype: string;
  category: string | null;
  price: number | string | null;
  description: string | null;
  image_url: string | null;
  duration: string | null;
  level: string | null;
  format: string | null;
  instructorid: number | null;
  classroom_course_id?: string | null;
};

type CourseForm = {
  courseid: number;
  coursename: string;
  category: string;
  price: string;
  description: string;
  image_url: string;
  duration: string;
  level: string;
  format: string;
  instructorid: string;
  classroom_course_id: string;
};

type InstructorOption = {
  instructorid: number;
  firstname: string;
  lastname: string;
};

function extractClassroomCourseId(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return '';
  // Extract ID from full Classroom URLs like https://classroom.google.com/c/ODY5MDk0NzIyMTAz or https://classroom.google.com/u/0/c/731234567890/details
  const match = trimmed.match(/classroom\.google\.com\/(?:u\/\d+\/)?c\/([a-zA-Z0-9_-]+)/i);
  let id = match && match[1] ? match[1] : trimmed;
  // If base64 encoded digits (e.g. ODY5MDk0NzIyMTAz -> 869094722103), decode it so Google API receives the numeric ID
  if (/^[a-zA-Z0-9_-]+$/.test(id) && !/^\d+$/.test(id)) {
    try {
      const decoded = typeof atob === 'function' ? atob(id) : Buffer.from(id, 'base64').toString('utf-8');
      if (/^\d+$/.test(decoded)) return decoded;
    } catch {
      // Keep as-is if decoding fails
    }
  }
  return id;
}

function blankCourse(): CourseForm {
  return {
    courseid: 0,
    coursename: '',
    category: 'Financial Planning',
    price: '0',
    description: '',
    image_url: '',
    duration: '',
    level: '',
    format: 'Hybrid',
    instructorid: '',
    classroom_course_id: '',
  };
}

function toForm(row: CourseRow): CourseForm {
  return {
    courseid: row.courseid,
    coursename: row.coursename || '',
    category: row.category || row.coursetype || 'Financial Planning',
    price: row.price === null || row.price === undefined ? '' : String(row.price),
    description: row.description || '',
    image_url: row.image_url || '',
    duration: row.duration || '',
    level: row.level || '',
    format: row.format || 'Hybrid',
    instructorid: row.instructorid === null || row.instructorid === undefined ? '' : String(row.instructorid),
    classroom_course_id: row.classroom_course_id || '',
  };
}

function instructorName(instructor: InstructorOption) {
  return `${instructor.firstname || ''} ${instructor.lastname || ''}`.trim() || `Instructor #${instructor.instructorid}`;
}

function formatPrice(value: CourseRow) {
  const amount = Number(value.price);
  if (!Number.isFinite(amount)) return 'Price not set';
  return `HK$${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

function schemaHint(message: string) {
  return /category|image_url|duration|level|format|instructorid|classroom_course_id/i.test(message) && /column|schema cache|does not exist/i.test(message)
    ? ' Some course fields are not ready yet — run supabase/classroom.sql in the Supabase SQL Editor, then reload this page.'
    : '';
}

export default function CoursesCMSPage() {
  const db = useMemo(() => createClient(), []);
  const [rows, setRows] = useState<CourseRow[]>([]);
  const [instructors, setInstructors] = useState<InstructorOption[]>([]);
  const [edit, setEdit] = useState<CourseForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const [coursesResult, instructorsResult] = await Promise.all([
      db.from('courses').select('*').order('courseid', { ascending: true }),
      db.from('instructors').select('instructorid, firstname, lastname').order('lastname').order('firstname'),
    ]);

    if (coursesResult.error) {
      setError(`Could not load courses. (${coursesResult.error.message})`);
      setRows([]);
    } else {
      setError('');
      setRows((coursesResult.data || []) as CourseRow[]);
      setInstructors((instructorsResult.data || []) as InstructorOption[]);
    }
    setLoading(false);
  }, [db]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const categories = useMemo(
    () => Array.from(new Set(rows.map((row) => row.category || row.coursetype).filter((category): category is string => Boolean(category)))),
    [rows],
  );

  const instructorById = useMemo(() => {
    const map = new Map<number, string>();
    for (const instructor of instructors) map.set(instructor.instructorid, instructorName(instructor));
    return map;
  }, [instructors]);

  function startNew() {
    setError('');
    setNotice('');
    setEdit(blankCourse());
  }

  function startEdit(row: CourseRow) {
    setError('');
    setNotice('');
    setEdit(toForm(row));
  }

  async function upload(file: File) {
    if (!edit) return;
    setUploading(true);
    setError('');
    const path = `courses/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '-')}`;
    const { error: uploadError } = await db.storage.from('cms').upload(path, file);
    if (uploadError) {
      setError(`Photo upload failed: ${uploadError.message}`);
    } else {
      const { data } = db.storage.from('cms').getPublicUrl(path);
      setEdit({ ...edit, image_url: data.publicUrl });
    }
    setUploading(false);
  }

  async function save() {
    if (!edit) return;

    const title = edit.coursename.trim();
    const price = Number(edit.price);

    if (!title) {
      setError('Course title is required.');
      return;
    }
    if (!Number.isFinite(price) || price < 0) {
      setError('Price must be zero or a positive number.');
      return;
    }

    setBusy(true);
    setError('');
    setNotice('');

    const categoryValue = edit.category.trim() || 'Other';
    const cleanClassroom = extractClassroomCourseId(edit.classroom_course_id);

    const payload = {
      coursename: title,
      coursetype: categoryValue,
      category: categoryValue,
      price,
      description: edit.description.trim() || null,
      image_url: edit.image_url.trim() || null,
      duration: edit.duration.trim() || null,
      level: edit.level.trim() || null,
      format: edit.format.trim() || null,
      instructorid: edit.instructorid ? Number(edit.instructorid) : null,
      classroom_course_id: cleanClassroom || null,
    };

    const result = edit.courseid
      ? await db.from('courses').update(payload).eq('courseid', edit.courseid)
      : await db.from('courses').insert(payload);

    if (result.error) {
      setError(`${result.error.message}${schemaHint(result.error.message)}`);
    } else {
      setEdit(null);
      setNotice('Course saved.');
      await load();
    }
    setBusy(false);
  }

  async function remove(row: CourseRow) {
    if (!window.confirm(`Delete “${row.coursename}”? This cannot be undone.`)) return;

    setBusy(true);
    setError('');
    const { error: deleteError } = await db.from('courses').delete().eq('courseid', row.courseid);
    if (deleteError) setError(deleteError.message);
    else {
      setNotice('Course deleted.');
      if (edit?.courseid === row.courseid) setEdit(null);
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
                  Course catalogue
                </p>
                <h1 style={{ marginTop: 6, color: '#1A1A2A' }}>Courses</h1>
                <p style={{ color: '#666', marginTop: 8, maxWidth: 680, lineHeight: 1.6 }}>
                  Manage titles, categories, prices, Google Classroom links, metadata, photos and the instructor shown on the public courses page.
                </p>
              </div>
              <button type="button" onClick={startNew} style={buttonStyle}>+ Add course</button>
            </div>

            {error && <div role="alert" style={alertStyle}>{error}</div>}
            {notice && <div role="status" style={noticeStyle}>{notice}</div>}

            <div style={{ display: 'grid', gridTemplateColumns: edit ? 'minmax(0, 1fr) 400px' : '1fr', gap: 24, marginTop: 24, alignItems: 'start' }}>
              <section style={panelStyle}>
                {loading ? (
                  <p style={{ color: '#888' }}>Loading courses…</p>
                ) : rows.length === 0 ? (
                  <p style={{ color: '#888' }}>No courses found. Add one to get started.</p>
                ) : (
                  rows.map((row) => (
                    <article key={row.courseid} style={{ display: 'flex', gap: 16, alignItems: 'center', padding: '18px 0', borderBottom: '1px solid #eee' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <strong style={{ color: '#1A1A2A' }}>{row.coursename}</strong>
                        <div style={{ color: '#666', fontSize: 13, marginTop: 6 }}>
                          {row.category || row.coursetype || 'Other'} · {formatPrice(row)}
                        </div>
                        <small style={{ color: '#999' }}>
                          {[row.duration, row.level, row.format].filter(Boolean).join(' · ')}
                          {row.instructorid && instructorById.get(row.instructorid)
                            ? ` · Instructor: ${instructorById.get(row.instructorid)}`
                            : ''}
                          {row.classroom_course_id ? (
                            <span style={{ color: '#2EC4B6', fontWeight: 600 }}> · 🏫 Classroom Linked</span>
                          ) : (
                            <span style={{ color: '#a00', opacity: 0.7 }}> · 🏫 No Classroom</span>
                          )}
                        </small>
                      </div>
                      <button type="button" onClick={() => startEdit(row)} style={smallButton}>Edit</button>
                      <button type="button" onClick={() => remove(row)} disabled={busy} style={{ ...smallButton, color: '#A32B2B' }}>Delete</button>
                    </article>
                  ))
                )}
              </section>

              {edit && (
                <aside style={panelStyle}>
                  <h2 style={{ color: '#1A1A2A', fontSize: 22 }}>{edit.courseid ? 'Edit course' : 'Add course'}</h2>
                  <p style={{ color: '#777', fontSize: 13, lineHeight: 1.5, margin: '8px 0 18px' }}>
                    Save publishes the change on the public courses page straight away.
                  </p>

                  <label style={labelStyle}>
                    Title *
                    <input value={edit.coursename} onChange={(event) => setEdit({ ...edit, coursename: event.target.value })} style={inputStyle} placeholder="CEO Wealth Management Program" />
                  </label>

                  <label style={labelStyle}>
                    Category *
                    <input list="course-category-options" value={edit.category} onChange={(event) => setEdit({ ...edit, category: event.target.value })} style={inputStyle} placeholder="Financial Planning" />
                  </label>
                  <datalist id="course-category-options">
                    {categories.map((category) => <option key={category} value={category} />)}
                  </datalist>

                  <label style={labelStyle}>
                    Google Classroom Link or Class ID
                    <input
                      value={edit.classroom_course_id}
                      onChange={(event) => setEdit({ ...edit, classroom_course_id: event.target.value })}
                      style={inputStyle}
                      placeholder="https://classroom.google.com/c/731234567890"
                    />
                    <span style={{ display: 'block', fontSize: 12, color: '#777', marginTop: 4, fontWeight: 400, lineHeight: 1.4 }}>
                      Paste the Google Classroom link (or ID). When a student pays for this course, they will automatically be invited to this classroom.
                    </span>
                  </label>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <label style={labelStyle}>
                      Price (HK$) *
                      <input type="number" min="0" step="0.01" value={edit.price} onChange={(event) => setEdit({ ...edit, price: event.target.value })} style={inputStyle} placeholder="12500" />
                    </label>
                    <label style={labelStyle}>
                      Duration
                      <input value={edit.duration} onChange={(event) => setEdit({ ...edit, duration: event.target.value })} style={inputStyle} placeholder="10 weeks" />
                    </label>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <label style={labelStyle}>
                      Level
                      <input value={edit.level} onChange={(event) => setEdit({ ...edit, level: event.target.value })} style={inputStyle} placeholder="Professional" />
                    </label>
                    <label style={labelStyle}>
                      Format
                      <input value={edit.format} onChange={(event) => setEdit({ ...edit, format: event.target.value })} style={inputStyle} placeholder="Hybrid" />
                    </label>
                  </div>

                  <label style={labelStyle}>
                    Instructor
                    <select value={edit.instructorid} onChange={(event) => setEdit({ ...edit, instructorid: event.target.value })} style={inputStyle}>
                      <option value="">— No instructor —</option>
                      {instructors.map((instructor) => (
                        <option key={instructor.instructorid} value={String(instructor.instructorid)}>
                          {instructorName(instructor)}
                        </option>
                      ))}
                    </select>
                  </label>
                  {instructors.length === 0 && (
                    <p style={{ color: '#777', fontSize: 13, margin: '-6px 0 12px' }}>
                      No instructors yet — add them under{' '}
                      <Link href="/admin/cms/instructors" style={{ color: '#7B1A2D', fontWeight: 700 }}>Content Manager → Instructors</Link>.
                    </p>
                  )}

                  <label style={labelStyle}>
                    Description
                    <textarea rows={5} value={edit.description} onChange={(event) => setEdit({ ...edit, description: event.target.value })} style={inputStyle} placeholder="What the course covers and who it is for." />
                  </label>

                  <label style={labelStyle}>
                    Course photo
                    <input type="file" accept="image/*" disabled={uploading} onChange={(event) => event.target.files && upload(event.target.files[0])} style={{ ...inputStyle, padding: 8 }} />
                  </label>
                  {uploading && <p style={{ color: '#777', fontSize: 13, margin: '-6px 0 12px' }}>Uploading photo…</p>}
                  {edit.image_url && (
                    <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 14 }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={edit.image_url} alt="Course preview" style={{ width: '100%', maxWidth: 180, height: 110, objectFit: 'cover', borderRadius: 10 }} />
                      <button type="button" onClick={() => setEdit({ ...edit, image_url: '' })} style={{ ...smallButton, color: '#A32B2B' }}>Remove photo</button>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                    <button type="button" onClick={save} disabled={busy || uploading} style={{ ...buttonStyle, opacity: busy || uploading ? 0.6 : 1 }}>
                      {busy ? 'Saving…' : 'Save course'}
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
