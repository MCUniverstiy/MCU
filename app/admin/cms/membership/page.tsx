'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import SiteLayout from '@/components/SiteLayout';
import AdminGuard from '@/components/AdminGuard';
import { createClient } from '@/lib/supabase/client';

type MembershipRow = {
  tierid: number;
  membname: string;
  tiers: string;
  category: string | null;
  price: number | string | null;
  currency: string | null;
  period: string | null;
  discountrate: number | string | null;
  description: string | null;
  features: unknown;
  color: string | null;
  highlight: boolean;
  active: boolean;
  sort_order: number;
};

type TierForm = {
  tierid: number;
  membname: string;
  tiers: string;
  category: string;
  price: string;
  currency: string;
  period: string;
  discountrate: string;
  description: string;
  features: string;
  color: string;
  highlight: boolean;
  active: boolean;
  sort_order: string;
};

const DEFAULT_FEATURES = [
  'International member directory access',
  'Priority invitations to MCU events',
];

function blankTier(): TierForm {
  return {
    tierid: 0,
    membname: '',
    tiers: '',
    category: 'International',
    price: '0',
    currency: 'USD',
    period: '/ year',
    discountrate: '0',
    description: '',
    features: DEFAULT_FEATURES.join('\n'),
    color: '#2EC4B6',
    highlight: false,
    active: true,
    sort_order: '0',
  };
}

function featureList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string').map((item) => item.trim()).filter(Boolean);
  }
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value) as unknown;
      if (Array.isArray(parsed)) return featureList(parsed);
    } catch {
      // Older/manual rows may contain newline-separated text.
    }
    return value.split('\n').map((item) => item.trim()).filter(Boolean);
  }
  return [];
}

function toForm(row: MembershipRow): TierForm {
  return {
    tierid: row.tierid,
    membname: row.membname || '',
    tiers: row.tiers || row.membname || '',
    category: row.category || 'International',
    price: row.price === null || row.price === undefined ? '' : String(row.price),
    currency: row.currency || 'USD',
    period: row.period || '/ year',
    discountrate: String(Math.round(Number(row.discountrate || 0) * 10000) / 100),
    description: row.description || '',
    features: featureList(row.features).join('\n'),
    color: row.color || '#2EC4B6',
    highlight: Boolean(row.highlight),
    active: row.active !== false,
    sort_order: String(row.sort_order ?? 0),
  };
}

function formatPrice(value: MembershipRow) {
  const amount = Number(value.price);
  if (!Number.isFinite(amount)) return 'Price not set';
  return `${(value.currency || 'USD').toUpperCase()} ${amount.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

export default function MembershipCMSPage() {
  const db = useMemo(() => createClient(), []);
  const [rows, setRows] = useState<MembershipRow[]>([]);
  const [edit, setEdit] = useState<TierForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error: queryError } = await db
      .from('membershiptiers')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('tierid', { ascending: true });

    if (queryError) {
      setError(`Membership tier fields are not ready yet. Run supabase/membership-cms.sql in the Supabase SQL Editor first. (${queryError.message})`);
      setRows([]);
    } else {
      setError('');
      setRows((data || []) as MembershipRow[]);
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
    () => Array.from(new Set(rows.map((row) => row.category).filter((category): category is string => Boolean(category)))),
    [rows],
  );

  function startNew() {
    setError('');
    setNotice('');
    setEdit(blankTier());
  }

  function startEdit(row: MembershipRow) {
    setError('');
    setNotice('');
    setEdit(toForm(row));
  }

  async function save() {
    if (!edit) return;

    const name = edit.membname.trim();
    const price = Number(edit.price);
    const discount = Number(edit.discountrate);
    const sortOrder = Number(edit.sort_order);
    const color = edit.color.trim();

    if (!name) {
      setError('Display name is required.');
      return;
    }
    if (!Number.isFinite(price) || price < 0) {
      setError('Price must be zero or a positive number.');
      return;
    }
    if (!Number.isFinite(discount) || discount < 0 || discount > 100) {
      setError('Course discount must be between 0 and 100 percent.');
      return;
    }
    if (!/^#[0-9A-Fa-f]{6}$/.test(color)) {
      setError('Accent colour must be a six-digit hex colour such as #E5A52E.');
      return;
    }

    setBusy(true);
    setError('');
    setNotice('');

    const payload = {
      membname: name,
      tiers: edit.tiers.trim() || name,
      category: edit.category.trim() || 'Other',
      price,
      currency: edit.currency.toUpperCase(),
      period: edit.period.trim() || '/ year',
      discountrate: discount / 100,
      description: edit.description.trim() || null,
      features: edit.features.split('\n').map((item) => item.trim()).filter(Boolean),
      color,
      highlight: edit.highlight,
      active: edit.active,
      sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
    };

    const result = edit.tierid
      ? await db.from('membershiptiers').update({ ...payload, stripe_price_id: null }).eq('tierid', edit.tierid)
      : await db.from('membershiptiers').insert(payload);

    if (result.error) {
      setError(
        /duplicate key.*membershiptiers_pkey/i.test(result.error.message)
          ? 'Supabase’s membership ID sequence is out of sync. Run the sequence repair in MEMBERSHIP-TIERS-SETUP.md, then try again.'
          : result.error.message,
      );
    } else {
      setEdit(null);
      setNotice('Membership tier saved.');
      await load();
    }
    setBusy(false);
  }

  async function remove(row: MembershipRow) {
    if (!window.confirm(`Delete “${row.membname}”? Members assigned to it will become unassigned.`)) return;

    setBusy(true);
    setError('');
    const { error: deleteError } = await db.from('membershiptiers').delete().eq('tierid', row.tierid);
    if (deleteError) setError(deleteError.message);
    else {
      setNotice('Membership tier deleted.');
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
                  Membership catalogue
                </p>
                <h1 style={{ marginTop: 6, color: '#1A1A2A' }}>Membership tiers</h1>
                <p style={{ color: '#666', marginTop: 8, maxWidth: 680, lineHeight: 1.6 }}>
                  Create, reorder, activate or edit the plans shown on the public membership page. Prices are saved in the selected currency.
                </p>
              </div>
              <button type="button" onClick={startNew} style={buttonStyle}>+ Add membership tier</button>
            </div>

            <div style={{ marginTop: 20, padding: '14px 18px', borderRadius: 12, background: 'rgba(46,196,182,0.10)', border: '1px solid rgba(46,196,182,0.28)', color: '#355', fontSize: 13, lineHeight: 1.6 }}>
              Tip: add one feature per line. Inactive tiers stay in this list for administrators but are hidden from visitors.
            </div>

            {error && <div role="alert" style={alertStyle}>{error}</div>}
            {notice && <div role="status" style={noticeStyle}>{notice}</div>}

            <div style={{ display: 'grid', gridTemplateColumns: edit ? 'minmax(0, 1fr) 400px' : '1fr', gap: 24, marginTop: 24, alignItems: 'start' }}>
              <section style={panelStyle}>
                {loading ? (
                  <p style={{ color: '#888' }}>Loading membership tiers…</p>
                ) : rows.length === 0 ? (
                  <p style={{ color: '#888' }}>No membership tiers found. Add one or run the Supabase migration.</p>
                ) : (
                  rows.map((row) => (
                    <article key={row.tierid} style={{ display: 'flex', gap: 16, alignItems: 'center', padding: '18px 0', borderBottom: '1px solid #eee' }}>
                      <div style={{ width: 12, height: 58, borderRadius: 8, background: row.color || '#7B1A2D', flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                          <strong style={{ color: '#1A1A2A' }}>{row.membname}</strong>
                          {!row.active && <span style={statusBadge('#777')}>Inactive</span>}
                          {row.highlight && <span style={statusBadge('#B47A00')}>Highlighted</span>}
                        </div>
                        <div style={{ color: '#666', fontSize: 13, marginTop: 6 }}>
                          {row.category || 'Other'} · {formatPrice(row)} {row.period || '/ year'} · {Math.round(Number(row.discountrate || 0) * 100)}% course discount
                        </div>
                        <small style={{ color: '#999' }}>{featureList(row.features).length} benefits · Display order {row.sort_order}</small>
                      </div>
                      <button type="button" onClick={() => startEdit(row)} style={smallButton}>Edit</button>
                      <button type="button" onClick={() => remove(row)} disabled={busy} style={{ ...smallButton, color: '#A32B2B' }}>Delete</button>
                    </article>
                  ))
                )}
              </section>

              {edit && (
                <aside style={panelStyle}>
                  <h2 style={{ color: '#1A1A2A', fontSize: 22 }}>{edit.tierid ? 'Edit membership tier' : 'Add membership tier'}</h2>
                  <p style={{ color: '#777', fontSize: 13, lineHeight: 1.5, margin: '8px 0 18px' }}>
                    The display name is what visitors see on the membership card.
                  </p>

                  <label style={labelStyle}>
                    Display name *
                    <input value={edit.membname} onChange={(event) => setEdit({ ...edit, membname: event.target.value })} style={inputStyle} placeholder="VIP Gold International" />
                  </label>
                  <label style={labelStyle}>
                    Tier label
                    <input value={edit.tiers} onChange={(event) => setEdit({ ...edit, tiers: event.target.value })} style={inputStyle} placeholder="VIP Gold" />
                  </label>
                  <label style={labelStyle}>
                    Category *
                    <input list="membership-category-options" value={edit.category} onChange={(event) => setEdit({ ...edit, category: event.target.value })} style={inputStyle} placeholder="International" />
                  </label>
                  <datalist id="membership-category-options">
                    {categories.map((category) => <option key={category} value={category} />)}
                  </datalist>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <label style={labelStyle}>
                      Price *
                      <input type="number" min="0" step="0.01" value={edit.price} onChange={(event) => setEdit({ ...edit, price: event.target.value })} style={inputStyle} placeholder="50000" />
                    </label>
                    <label style={labelStyle}>
                      Currency
                      <select value={edit.currency} onChange={(event) => setEdit({ ...edit, currency: event.target.value })} style={inputStyle}>
                        <option value="USD">USD</option>
                        <option value="HKD">HKD</option>
                        <option value="SGD">SGD</option>
                        <option value="GBP">GBP</option>
                        <option value="EUR">EUR</option>
                        <option value="AUD">AUD</option>
                      </select>
                    </label>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <label style={labelStyle}>
                      Billing label
                      <input value={edit.period} onChange={(event) => setEdit({ ...edit, period: event.target.value })} style={inputStyle} placeholder="/ year" />
                    </label>
                    <label style={labelStyle}>
                      Course discount (%)
                      <input type="number" min="0" max="100" step="1" value={edit.discountrate} onChange={(event) => setEdit({ ...edit, discountrate: event.target.value })} style={inputStyle} placeholder="10" />
                    </label>
                  </div>

                  <label style={labelStyle}>
                    Description
                    <textarea rows={4} value={edit.description} onChange={(event) => setEdit({ ...edit, description: event.target.value })} style={inputStyle} placeholder="Describe who this membership is for." />
                  </label>
                  <label style={labelStyle}>
                    Benefits (one per line)
                    <textarea rows={7} value={edit.features} onChange={(event) => setEdit({ ...edit, features: event.target.value })} style={inputStyle} placeholder="Private briefings\nPriority invitations" />
                  </label>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, alignItems: 'end' }}>
                    <label style={labelStyle}>
                      Accent colour
                      <input type="color" value={/^#[0-9A-Fa-f]{6}$/.test(edit.color) ? edit.color : '#2EC4B6'} onChange={(event) => setEdit({ ...edit, color: event.target.value })} style={{ ...inputStyle, height: 42, padding: 4 }} />
                    </label>
                    <label style={labelStyle}>
                      Display order
                      <input type="number" step="1" value={edit.sort_order} onChange={(event) => setEdit({ ...edit, sort_order: event.target.value })} style={inputStyle} />
                    </label>
                  </div>

                  <label style={checkLabelStyle}>
                    <input type="checkbox" checked={edit.highlight} onChange={(event) => setEdit({ ...edit, highlight: event.target.checked })} />
                    Highlight as most popular
                  </label>
                  <label style={checkLabelStyle}>
                    <input type="checkbox" checked={edit.active} onChange={(event) => setEdit({ ...edit, active: event.target.checked })} />
                    Visible on the public membership page
                  </label>

                  <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                    <button type="button" onClick={save} disabled={busy} style={{ ...buttonStyle, opacity: busy ? 0.6 : 1 }}>
                      {busy ? 'Saving…' : 'Save tier'}
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

const checkLabelStyle: React.CSSProperties = {
  display: 'flex',
  gap: 9,
  alignItems: 'center',
  color: '#555',
  fontSize: 13,
  marginTop: 12,
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
