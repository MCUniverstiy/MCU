'use client';

import { useState, useEffect, useCallback } from 'react';
import SiteLayout from '@/components/SiteLayout';
import { createClient } from '@/lib/supabase/client';

interface CourseOption {
  courseid: number;
  coursename: string;
}

interface EnrollmentRow {
  enrollmentid: number;
  enrollmentdate: string | null;
  paymentstatus: string | null;
  grade: string | null;
  users: {
    memberid: number | null;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
  } | null;
}

export default function AdminGradesPage() {
  const [authChecked, setAuthChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [rows, setRows] = useState<EnrollmentRow[]>([]);
  const [loadingRows, setLoadingRows] = useState(false);
  const [savingId, setSavingId] = useState<number | 'all' | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Check admin status
  useEffect(() => {
    async function checkAdmin() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          window.location.href = '/login?redirect=/admin/grades';
          return;
        }
        const { data: profile } = await supabase
          .from('users')
          .select('is_admin')
          .eq('id', user.id)
          .single();
        setIsAdmin(Boolean(profile?.is_admin));
      } catch {
        setIsAdmin(false);
      } finally {
        setAuthChecked(true);
      }
    }
    checkAdmin();
  }, []);

  // Load course list
  useEffect(() => {
    if (!isAdmin) return;
    async function loadCourses() {
      const supabase = createClient();
      const { data } = await supabase
        .from('courses')
        .select('courseid, coursename')
        .order('courseid');
      if (data && data.length > 0) {
        setCourses(data);
        setSelectedCourseId(data[0].courseid);
      }
    }
    loadCourses();
  }, [isAdmin]);

  // Load enrollments for selected course
  const loadEnrollments = useCallback(async () => {
    if (!selectedCourseId) return;
    setLoadingRows(true);
    setMessage(null);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('enrollments')
        .select('enrollmentid, enrollmentdate, paymentstatus, grade, users(memberid, first_name, last_name, email)')
        .eq('courseid', selectedCourseId)
        .order('enrollmentid');
      if (error) throw error;
      setRows((data as unknown as EnrollmentRow[]) || []);
    } catch (err) {
      setMessage('Failed to load enrollments: ' + (err instanceof Error ? err.message : 'unknown'));
    } finally {
      setLoadingRows(false);
    }
  }, [selectedCourseId]);

  useEffect(() => { loadEnrollments(); }, [loadEnrollments]);

  const setGrade = async (enrollmentid: number, grade: 'Pass' | 'Fail' | null) => {
    setSavingId(enrollmentid);
    setMessage(null);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('enrollments')
        .update({ grade })
        .eq('enrollmentid', enrollmentid);
      if (error) throw error;
      setRows((prev) => prev.map((r) => r.enrollmentid === enrollmentid ? { ...r, grade } : r));
    } catch (err) {
      setMessage('Failed to save grade: ' + (err instanceof Error ? err.message : 'unknown'));
    } finally {
      setSavingId(null);
    }
  };

  const markAll = async (grade: 'Pass' | 'Fail') => {
    if (!selectedCourseId) return;
    if (!confirm(`Mark ALL ungraded students in this course as "${grade}"?`)) return;
    setSavingId('all');
    setMessage(null);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('enrollments')
        .update({ grade })
        .eq('courseid', selectedCourseId)
        .is('grade', null);
      if (error) throw error;
      await loadEnrollments();
      setMessage(`All ungraded students marked as ${grade}.`);
    } catch (err) {
      setMessage('Bulk update failed: ' + (err instanceof Error ? err.message : 'unknown'));
    } finally {
      setSavingId(null);
    }
  };

  const gradeBadge = (grade: string | null) => {
    const color = grade === 'Pass' ? '#2EC4B6' : grade === 'Fail' ? '#C0392B' : '#999';
    const bg = grade === 'Pass' ? 'rgba(46,196,182,0.12)' : grade === 'Fail' ? 'rgba(192,57,43,0.10)' : 'rgba(0,0,0,0.05)';
    return (
      <span style={{
        padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700,
        color, background: bg,
      }}>
        {grade || 'Ungraded'}
      </span>
    );
  };

  if (!authChecked) {
    return (
      <SiteLayout>
        <div style={{ paddingTop: 160, textAlign: 'center', color: '#888', minHeight: '60vh' }}>
          Checking access...
        </div>
      </SiteLayout>
    );
  }

  if (!isAdmin) {
    return (
      <SiteLayout>
        <div style={{ paddingTop: 160, textAlign: 'center', minHeight: '60vh' }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1A1A2A', marginBottom: 12 }}>Access Denied</h1>
          <p style={{ color: '#666' }}>This page is restricted to administrators and instructors.</p>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div style={{ paddingTop: 120, paddingBottom: 100, minHeight: '80vh', background: '#F8F8FA' }}>
        <div className="container">
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <div style={{ width: 32, height: 2, background: '#7B1A2D' }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: '#7B1A2D', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Admin</span>
            </div>
            <h1 style={{ fontSize: 32, fontWeight: 700, color: '#1A1A2A' }}>Grading Dashboard</h1>
            <p style={{ color: '#666', marginTop: 8 }}>Select a course, review enrolled students, and assign Pass / Fail grades. Passing automatically issues a certificate.</p>
          </div>

          <div style={{
            background: '#fff', borderRadius: 16, padding: 24, border: '1px solid rgba(0,0,0,0.06)',
            display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', marginBottom: 24,
          }}>
            <div style={{ flex: 1, minWidth: 260 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>Course</label>
              <select
                value={selectedCourseId ?? ''}
                onChange={(e) => setSelectedCourseId(Number(e.target.value))}
                style={{
                  width: '100%', padding: '12px 14px', fontSize: 14, borderRadius: 10,
                  border: '1.5px solid #DDD', outline: 'none', background: '#fff', cursor: 'pointer',
                }}
              >
                {courses.map((c) => (
                  <option key={c.courseid} value={c.courseid}>
                    #{c.courseid} — {c.coursename}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
              <button
                onClick={() => markAll('Pass')}
                disabled={savingId !== null || rows.length === 0}
                style={{
                  padding: '12px 20px', borderRadius: 30, fontSize: 13, fontWeight: 600, border: 'none',
                  background: '#2EC4B6', color: '#fff', cursor: 'pointer', opacity: savingId !== null ? 0.6 : 1,
                }}
              >
                {savingId === 'all' ? 'Saving...' : 'Mark All Ungraded as Pass'}
              </button>
              <button
                onClick={loadEnrollments}
                disabled={loadingRows}
                style={{
                  padding: '12px 20px', borderRadius: 30, fontSize: 13, fontWeight: 600,
                  border: '1.5px solid #DDD', background: '#fff', color: '#555', cursor: 'pointer',
                }}
              >
                ↻ Refresh
              </button>
            </div>
          </div>

          {message && (
            <div style={{
              padding: '12px 18px', borderRadius: 10, marginBottom: 20, fontSize: 14,
              background: message.startsWith('Failed') || message.startsWith('Bulk update failed') ? 'rgba(192,57,43,0.08)' : 'rgba(46,196,182,0.10)',
              color: message.startsWith('Failed') || message.startsWith('Bulk update failed') ? '#C0392B' : '#1A8A80',
            }}>
              {message}
            </div>
          )}

          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid rgba(0,0,0,0.06)', overflow: 'hidden' }}>
            {loadingRows ? (
              <div style={{ padding: 48, textAlign: 'center', color: '#888' }}>Loading students...</div>
            ) : rows.length === 0 ? (
              <div style={{ padding: 48, textAlign: 'center', color: '#888' }}>No students enrolled in this course yet.</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr style={{ background: '#F8F8FA', textAlign: 'left' }}>
                    {['Member ID', 'Student', 'Email', 'Enrolled', 'Payment', 'Grade', 'Actions'].map((h) => (
                      <th key={h} style={{ padding: '14px 18px', fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.enrollmentid} style={{ borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                      <td style={{ padding: '14px 18px', fontWeight: 700, color: '#7B1A2D' }}>
                        {r.users?.memberid ? `#${r.users.memberid}` : '—'}
                      </td>
                      <td style={{ padding: '14px 18px', fontWeight: 600, color: '#1A1A2A' }}>
                        {`${r.users?.first_name || ''} ${r.users?.last_name || ''}`.trim() || '—'}
                      </td>
                      <td style={{ padding: '14px 18px', color: '#666' }}>{r.users?.email || '—'}</td>
                      <td style={{ padding: '14px 18px', color: '#666' }}>{r.enrollmentdate || '—'}</td>
                      <td style={{ padding: '14px 18px' }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: r.paymentstatus === 'Paid' ? '#2EC4B6' : '#E5A52E' }}>
                          {r.paymentstatus || '—'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px' }}>{gradeBadge(r.grade)}</td>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            onClick={() => setGrade(r.enrollmentid, 'Pass')}
                            disabled={savingId !== null || r.grade === 'Pass'}
                            style={{
                              padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, border: 'none',
                              background: r.grade === 'Pass' ? '#E8E8EC' : '#2EC4B6',
                              color: r.grade === 'Pass' ? '#999' : '#fff',
                              cursor: r.grade === 'Pass' ? 'default' : 'pointer',
                            }}
                          >
                            {savingId === r.enrollmentid ? '...' : 'Pass'}
                          </button>
                          <button
                            onClick={() => setGrade(r.enrollmentid, 'Fail')}
                            disabled={savingId !== null || r.grade === 'Fail'}
                            style={{
                              padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, border: 'none',
                              background: r.grade === 'Fail' ? '#E8E8EC' : '#C0392B',
                              color: r.grade === 'Fail' ? '#999' : '#fff',
                              cursor: r.grade === 'Fail' ? 'default' : 'pointer',
                            }}
                          >
                            Fail
                          </button>
                          {r.grade && (
                            <button
                              onClick={() => setGrade(r.enrollmentid, null)}
                              disabled={savingId !== null}
                              style={{
                                padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                                border: '1.5px solid #DDD', background: '#fff', color: '#888', cursor: 'pointer',
                              }}
                            >
                              Clear
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <p style={{ fontSize: 12, color: '#999', marginTop: 16 }}>
            💡 Setting a grade to Pass automatically issues a certificate (MCU-YYYY-NNNNNN) in the certificates table.
          </p>
        </div>
      </div>
    </SiteLayout>
  );
}
