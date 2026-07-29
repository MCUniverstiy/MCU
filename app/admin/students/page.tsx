'use client';

import { useState, useEffect } from 'react';
import SiteLayout from '@/components/SiteLayout';
import { createClient } from '@/lib/supabase/client';
import {
  CertTemplateSettings, DEFAULT_CERT_TEMPLATE, mergeTemplate, fieldStyle,
} from '@/lib/certTemplate';

interface CertificateInfo {
  certificatenumber: string;
  recipientname: string | null;
  coursename: string | null;
  issuedate: string | null;
}

interface EnrollmentInfo {
  enrollmentid: number;
  enrollmentdate: string | null;
  paymentstatus: string | null;
  grade: string | null;
  courses: { coursename: string; price: number } | null;
  certificates: CertificateInfo | null;
}

interface StudentRow {
  id: string;
  memberid: number | null;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone_number: string | null;
  area_of_interest: string | null;
  created_at: string | null;
  membershiptiers: { membname: string; discountrate: number } | null;
  enrollments: EnrollmentInfo[];
}

export default function AdminStudentsPage() {
  const [authChecked, setAuthChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [memberFilter, setMemberFilter] = useState<'all' | 'members' | 'nonmembers'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [certToPrint, setCertToPrint] = useState<CertificateInfo | null>(null);
  const [certTpl, setCertTpl] = useState<CertTemplateSettings>(DEFAULT_CERT_TEMPLATE);

  useEffect(() => {
    async function init() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          window.location.href = '/login?redirect=/admin/students';
          return;
        }
        const { data: me } = await supabase
          .from('users').select('is_admin').eq('id', user.id).single();
        const admin = Boolean(me?.is_admin);
        setIsAdmin(admin);
        setAuthChecked(true);
        if (!admin) return;

        // Load saved certificate template design (fall back to default)
        const { data: tplRow } = await supabase
          .from('certtemplate').select('settings').eq('id', 1).single();
        if (tplRow?.settings) setCertTpl(mergeTemplate(tplRow.settings));

        const { data, error } = await supabase
          .from('users')
          .select(`
            id, memberid, first_name, last_name, email, phone_number,
            area_of_interest, created_at,
            membershiptiers(membname, discountrate),
            enrollments(
              enrollmentid, enrollmentdate, paymentstatus, grade,
              courses(coursename, price),
              certificates(certificatenumber, recipientname, coursename, issuedate)
            )
          `)
          .order('memberid', { ascending: true, nullsFirst: false });

        if (error) throw error;
        setStudents((data as unknown as StudentRow[]) || []);
      } catch (err) {
        console.error('Failed to load students:', err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  const filtered = students.filter((s) => {
    // Membership filter
    if (memberFilter === 'members' && !s.memberid) return false;
    if (memberFilter === 'nonmembers' && s.memberid) return false;

    // Search filter
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      `${s.first_name || ''} ${s.last_name || ''}`.toLowerCase().includes(q) ||
      (s.email || '').toLowerCase().includes(q) ||
      String(s.memberid || '').includes(q)
    );
  });

  const totalSpend = (s: StudentRow) =>
    s.enrollments
      .filter((e) => e.paymentstatus === 'Paid')
      .reduce((sum, e) => sum + (Number(e.courses?.price) || 0), 0);

  if (!authChecked) {
    return (
      <SiteLayout>
        <div style={{ paddingTop: 160, textAlign: 'center', color: '#888', minHeight: '60vh' }}>Checking access...</div>
      </SiteLayout>
    );
  }

  if (!isAdmin) {
    return (
      <SiteLayout>
        <div style={{ paddingTop: 160, textAlign: 'center', minHeight: '60vh' }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1A1A2A', marginBottom: 12 }}>Access Denied</h1>
          <p style={{ color: '#666' }}>This page is restricted to administrators.</p>
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
              <span style={{ fontSize: 13, fontWeight: 600, color: '#7B1A2D', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Admin · CRM</span>
            </div>
            <h1 style={{ fontSize: 32, fontWeight: 700, color: '#1A1A2A' }}>Student Management</h1>
            <p style={{ color: '#666', marginTop: 8 }}>
              Full view of every student: membership, enrollments, payments and certificates. Click a row to expand.
            </p>
          </div>

          {/* Search + stats */}
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center', marginBottom: 24 }}>
            <input
              type="text"
              placeholder="🔍 Search by name, email or member ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                flex: 1, minWidth: 280, padding: '13px 18px', fontSize: 14, borderRadius: 30,
                border: '1.5px solid #DDD', outline: 'none', background: '#fff',
              }}
            />

            {/* Membership filter buttons */}
            <div style={{ display: 'flex', gap: 8, background: '#fff', borderRadius: 30, padding: 4, border: '1.5px solid #DDD' }}>
              {([
                { key: 'all', label: 'All' },
                { key: 'members', label: '💳 Members Only' },
                { key: 'nonmembers', label: 'Non-Members' },
              ] as const).map((f) => (
                <button
                  key={f.key}
                  onClick={() => setMemberFilter(f.key)}
                  style={{
                    padding: '9px 18px', borderRadius: 30, fontSize: 13, fontWeight: 600,
                    border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                    background: memberFilter === f.key ? '#7B1A2D' : 'transparent',
                    color: memberFilter === f.key ? '#fff' : '#666',
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              {[
                { label: 'Students', value: students.length },
                { label: 'Members', value: students.filter((s) => s.memberid).length },
                { label: 'Certificates', value: students.reduce((n, s) => n + s.enrollments.filter((e) => e.certificates).length, 0) },
              ].map((stat) => (
                <div key={stat.label} style={{
                  background: '#fff', borderRadius: 14, padding: '10px 20px', textAlign: 'center',
                  border: '1px solid rgba(0,0,0,0.06)',
                }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#7B1A2D' }}>{stat.value}</div>
                  <div style={{ fontSize: 11, color: '#888', fontWeight: 600, textTransform: 'uppercase' }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid rgba(0,0,0,0.06)', overflow: 'hidden' }}>
            {loading ? (
              <div style={{ padding: 48, textAlign: 'center', color: '#888' }}>Loading students...</div>
            ) : filtered.length === 0 ? (
              <div style={{ padding: 48, textAlign: 'center', color: '#888' }}>No students found.</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr style={{ background: '#F8F8FA', textAlign: 'left' }}>
                    {['Member ID', 'Name', 'Email', 'Tier', 'Courses', 'Certificates', 'Total Paid'].map((h) => (
                      <th key={h} style={{ padding: '14px 18px', fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s) => {
                    const certCount = s.enrollments.filter((e) => e.certificates).length;
                    const expanded = expandedId === s.id;
                    return (
                      <>
                        <tr
                          key={s.id}
                          onClick={() => setExpandedId(expanded ? null : s.id)}
                          style={{ borderTop: '1px solid rgba(0,0,0,0.05)', cursor: 'pointer', background: expanded ? 'rgba(123,26,45,0.03)' : undefined }}
                        >
                          <td style={{ padding: '14px 18px', fontWeight: 700, color: '#7B1A2D' }}>{s.memberid ? `#${s.memberid}` : '—'}</td>
                          <td style={{ padding: '14px 18px', fontWeight: 600, color: '#1A1A2A' }}>
                            {expanded ? '▾ ' : '▸ '}{`${s.first_name || ''} ${s.last_name || ''}`.trim() || '—'}
                          </td>
                          <td style={{ padding: '14px 18px', color: '#666' }}>{s.email}</td>
                          <td style={{ padding: '14px 18px' }}>
                            {s.membershiptiers ? (
                              <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, color: '#7B1A2D', background: 'rgba(123,26,45,0.08)' }}>
                                {s.membershiptiers.membname}
                              </span>
                            ) : (
                              <span style={{ fontSize: 12, color: '#aaa' }}>No membership</span>
                            )}
                          </td>
                          <td style={{ padding: '14px 18px', color: '#444' }}>{s.enrollments.length}</td>
                          <td style={{ padding: '14px 18px', color: certCount > 0 ? '#2EC4B6' : '#aaa', fontWeight: 600 }}>{certCount} 🎓</td>
                          <td style={{ padding: '14px 18px', fontWeight: 600, color: '#1A1A2A' }}>HK${totalSpend(s).toLocaleString()}</td>
                        </tr>

                        {expanded && (
                          <tr key={`${s.id}-detail`}>
                            <td colSpan={7} style={{ padding: '0 18px 20px', background: 'rgba(123,26,45,0.02)' }}>
                              <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 24, padding: '16px 0' }}>
                                {/* Profile info */}
                                <div style={{ fontSize: 13, color: '#555', lineHeight: 2 }}>
                                  <div style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', marginBottom: 6 }}>Profile</div>
                                  <div>📞 {s.phone_number || '—'}</div>
                                  <div>🎯 {s.area_of_interest || '—'}</div>
                                  <div>🗓 Joined: {s.created_at ? s.created_at.slice(0, 10) : '—'}</div>
                                  {s.membershiptiers && (
                                    <div>💳 Discount: {(Number(s.membershiptiers.discountrate) * 100).toFixed(0)}%</div>
                                  )}
                                </div>

                                {/* Enrollments + certificates */}
                                <div>
                                  <div style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', marginBottom: 8 }}>
                                    Enrollments & Certificates
                                  </div>
                                  {s.enrollments.length === 0 ? (
                                    <div style={{ fontSize: 13, color: '#999' }}>No enrollments yet.</div>
                                  ) : (
                                    <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse', background: '#fff', borderRadius: 10, overflow: 'hidden' }}>
                                      <thead>
                                        <tr style={{ background: '#F3F3F6', textAlign: 'left' }}>
                                          {['Course', 'Enrolled', 'Payment', 'Grade', 'Certificate No.', 'Issued', ''].map((h) => (
                                            <th key={h} style={{ padding: '8px 12px', fontSize: 10, fontWeight: 700, color: '#999', textTransform: 'uppercase' }}>{h}</th>
                                          ))}
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {s.enrollments.map((e) => (
                                          <tr key={e.enrollmentid} style={{ borderTop: '1px solid rgba(0,0,0,0.04)' }}>
                                            <td style={{ padding: '10px 12px', fontWeight: 600, color: '#1A1A2A' }}>{e.courses?.coursename || '—'}</td>
                                            <td style={{ padding: '10px 12px', color: '#666' }}>{e.enrollmentdate || '—'}</td>
                                            <td style={{ padding: '10px 12px', color: e.paymentstatus === 'Paid' ? '#2EC4B6' : '#E5A52E', fontWeight: 600 }}>{e.paymentstatus}</td>
                                            <td style={{ padding: '10px 12px' }}>
                                              <span style={{
                                                fontWeight: 700, fontSize: 12,
                                                color: e.grade === 'Pass' ? '#2EC4B6' : e.grade === 'Fail' ? '#C0392B' : '#999',
                                              }}>
                                                {e.grade || 'Ungraded'}
                                              </span>
                                            </td>
                                            <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontWeight: 600, color: '#7B1A2D' }}>
                                              {e.certificates?.certificatenumber || '—'}
                                            </td>
                                            <td style={{ padding: '10px 12px', color: '#666' }}>{e.certificates?.issuedate || '—'}</td>
                                            <td style={{ padding: '10px 12px' }}>
                                              {e.certificates && (
                                                <button
                                                  onClick={(ev) => { ev.stopPropagation(); setCertToPrint(e.certificates); }}
                                                  style={{
                                                    padding: '5px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                                                    border: 'none', background: '#E5A52E', color: '#fff', cursor: 'pointer',
                                                  }}
                                                >
                                                  🎓 View Certificate
                                                </button>
                                              )}
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* PRINTABLE CERTIFICATE MODAL */}
      {certToPrint && (
        <div
          className="cert-overlay"
          style={{
            position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
          }}
        >
          <div style={{ maxWidth: 760, width: '100%' }}>
            <div
              id="certificate-print-area"
              style={{
                position: 'relative',
                aspectRatio: certTpl.aspectRatio,
                fontFamily: 'Georgia, "Times New Roman", serif',
                color: '#1A1A2A',
                ...(certTpl.backgroundImage
                  ? {
                      backgroundImage: `url(${certTpl.backgroundImage})`,
                      backgroundSize: '100% 100%',
                      backgroundRepeat: 'no-repeat',
                    }
                  : {
                      background: '#FFFDF8',
                      border: '10px double #7B1A2D',
                      borderRadius: 6,
                    }),
              }}
            >
              {/* Built-in decorations — hidden when your template image has its own */}
              {!certTpl.backgroundImage && (
                <>
                  <div style={{ position: 'absolute', top: '8%', width: '100%', textAlign: 'center', fontSize: 13, letterSpacing: '0.35em', textTransform: 'uppercase', color: '#7B1A2D', fontWeight: 700 }}>
                    MCU Institute
                  </div>
                  <div style={{ position: 'absolute', top: '15%', width: '100%', textAlign: 'center', fontSize: 34, fontWeight: 700 }}>
                    Certificate of Completion
                  </div>
                  <div style={{ position: 'absolute', top: '28%', left: '45%', width: '10%', height: 2, background: '#E5A52E' }} />
                  <div style={{ position: 'absolute', top: '34%', width: '100%', textAlign: 'center', fontSize: 14, color: '#666' }}>
                    This is to certify that
                  </div>
                  <div style={{ position: 'absolute', top: '52%', width: '100%', textAlign: 'center', fontSize: 14, color: '#666' }}>
                    has successfully completed the program
                  </div>
                  <div style={{ position: 'absolute', top: '80%', width: '100%', textAlign: 'center', fontSize: 26 }}>🎓</div>
                  <div style={{ position: 'absolute', top: `${certTpl.fields.certNo.top + 5}%`, left: `${certTpl.fields.certNo.left}%`, width: `${certTpl.fields.certNo.width}%`, fontSize: 11, color: '#555', textAlign: 'left' }}>
                    Certificate No.
                  </div>
                  <div style={{ position: 'absolute', top: `${certTpl.fields.issued.top + 5}%`, left: `${certTpl.fields.issued.left}%`, width: `${certTpl.fields.issued.width}%`, fontSize: 11, color: '#555', textAlign: 'right' }}>
                    Date of Issue
                  </div>
                </>
              )}

              {/* THE 4 AUTO-FILLED FIELDS — positions come from the saved template (/admin/template) */}
              <div style={{ ...fieldStyle(certTpl.fields.name), fontStyle: 'italic' }}>
                {certToPrint.recipientname || '—'}
              </div>
              <div style={fieldStyle(certTpl.fields.course)}>
                {certToPrint.coursename || '—'}
              </div>
              <div style={fieldStyle(certTpl.fields.certNo)}>
                {certToPrint.certificatenumber}
              </div>
              <div style={fieldStyle(certTpl.fields.issued)}>
                {certToPrint.issuedate || '—'}
              </div>
            </div>

            <div className="cert-actions" style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 20 }}>
              <button
                onClick={() => window.print()}
                style={{
                  padding: '13px 28px', borderRadius: 30, fontSize: 14, fontWeight: 600,
                  border: 'none', background: '#E5A52E', color: '#fff', cursor: 'pointer',
                }}
              >
                🖨 Print / Save as PDF
              </button>
              <button
                onClick={() => setCertToPrint(null)}
                style={{
                  padding: '13px 28px', borderRadius: 30, fontSize: 14, fontWeight: 600,
                  border: '1.5px solid rgba(255,255,255,0.5)', background: 'transparent', color: '#fff', cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </div>

          {/* Print styles: only the certificate prints */}
          <style jsx global>{`
            @media print {
              body * { visibility: hidden !important; }
              #certificate-print-area, #certificate-print-area * { visibility: visible !important; }
              #certificate-print-area {
                position: fixed !important; inset: 0 !important; margin: auto !important;
                border-radius: 0 !important;
              }
              .cert-actions { display: none !important; }
            }
          `}</style>
        </div>
      )}
    </SiteLayout>
  );
}
