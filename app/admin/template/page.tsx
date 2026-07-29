'use client';

import { useState, useEffect } from 'react';
import SiteLayout from '@/components/SiteLayout';
import { createClient } from '@/lib/supabase/client';
import {
  CertTemplateSettings, CertField, DEFAULT_CERT_TEMPLATE, mergeTemplate, fieldStyle,
} from '@/lib/certTemplate';

const SAMPLE = {
  name: 'Chan Tai Man',
  course: 'Professional Financial Planning Program',
  certNo: 'MCU-2026-000001',
  issued: '2026-07-29',
};

const FIELD_LABELS: Record<keyof CertTemplateSettings['fields'], string> = {
  name: '👤 Student Name',
  course: '📚 Course Name',
  certNo: '🔢 Certificate No.',
  issued: '📅 Date of Issue',
};

export default function TemplateEditorPage() {
  const [authChecked, setAuthChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [tpl, setTpl] = useState<CertTemplateSettings>(DEFAULT_CERT_TEMPLATE);
  const [activeField, setActiveField] = useState<keyof CertTemplateSettings['fields']>('name');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = '/login?redirect=/admin/template'; return; }
      const { data: me } = await supabase.from('users').select('is_admin').eq('id', user.id).single();
      setIsAdmin(Boolean(me?.is_admin));
      setAuthChecked(true);

      const { data } = await supabase.from('certtemplate').select('settings').eq('id', 1).single();
      if (data?.settings) setTpl(mergeTemplate(data.settings));
    }
    init();
  }, []);

  const updateField = (key: keyof CertTemplateSettings['fields'], patch: Partial<CertField>) => {
    setTpl((prev) => ({
      ...prev,
      fields: { ...prev.fields, [key]: { ...prev.fields[key], ...patch } },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('certtemplate')
        .update({ settings: tpl as unknown as Record<string, unknown>, updated_at: new Date().toISOString() })
        .eq('id', 1);
      if (error) throw error;
      setMessage('✅ Saved! All certificates now use this design.');
    } catch (err) {
      setMessage('❌ Save failed: ' + (err instanceof Error ? err.message : 'unknown') + ' — did you run template.sql in Supabase?');
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setMessage(null);
    try {
      const supabase = createClient();
      const path = `template-${Date.now()}.${file.name.split('.').pop()}`;
      const { error } = await supabase.storage.from('certtemplates').upload(path, file, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from('certtemplates').getPublicUrl(path);
      setTpl((prev) => ({ ...prev, backgroundImage: data.publicUrl }));
      setMessage('🖼 Image uploaded — now drag the sliders to position the text, then click Save.');
    } catch (err) {
      setMessage('❌ Upload failed: ' + (err instanceof Error ? err.message : 'unknown') + ' — did you run template.sql in Supabase?');
    } finally {
      setUploading(false);
    }
  };

  const f = tpl.fields[activeField];

  if (!authChecked) {
    return <SiteLayout><div style={{ paddingTop: 160, textAlign: 'center', color: '#888', minHeight: '60vh' }}>Checking access...</div></SiteLayout>;
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

  const slider = (label: string, value: number, min: number, max: number, onChange: (v: number) => void, unit = '%') => (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 4 }}>
        <span>{label}</span>
        <span style={{ color: '#7B1A2D' }}>{value}{unit}</span>
      </div>
      <input
        type="range" min={min} max={max} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: '100%', accentColor: '#7B1A2D' }}
      />
    </div>
  );

  return (
    <SiteLayout>
      <div style={{ paddingTop: 120, paddingBottom: 100, minHeight: '80vh', background: '#F8F8FA' }}>
        <div className="container">
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <div style={{ width: 32, height: 2, background: '#7B1A2D' }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: '#7B1A2D', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Admin</span>
            </div>
            <h1 style={{ fontSize: 32, fontWeight: 700, color: '#1A1A2A' }}>Certificate Template Editor</h1>
            <p style={{ color: '#666', marginTop: 8 }}>
              Upload your template image, pick a field, drag the sliders — the preview updates live. Click Save when it looks right.
            </p>
          </div>

          {message && (
            <div style={{
              padding: '12px 18px', borderRadius: 10, marginBottom: 20, fontSize: 14,
              background: message.startsWith('❌') ? 'rgba(192,57,43,0.08)' : 'rgba(46,196,182,0.10)',
              color: message.startsWith('❌') ? '#C0392B' : '#1A8A80',
            }}>
              {message}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 24, alignItems: 'start' }}>
            {/* ============ CONTROLS ============ */}
            <div style={{ background: '#fff', borderRadius: 16, padding: 24, border: '1px solid rgba(0,0,0,0.06)' }}>
              {/* Image upload */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#888', textTransform: 'uppercase', marginBottom: 8 }}>Template Image</div>
                <label style={{
                  display: 'block', textAlign: 'center', padding: '12px', borderRadius: 10,
                  border: '2px dashed #CCC', cursor: 'pointer', fontSize: 13, color: '#666', fontWeight: 600,
                }}>
                  {uploading ? 'Uploading...' : tpl.backgroundImage ? '🖼 Replace image' : '⬆️ Upload template image (PNG/JPG)'}
                  <input type="file" accept="image/png,image/jpeg" onChange={handleUpload} style={{ display: 'none' }} />
                </label>
                {tpl.backgroundImage && (
                  <button
                    onClick={() => setTpl((p) => ({ ...p, backgroundImage: '' }))}
                    style={{ marginTop: 8, fontSize: 12, color: '#C0392B', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                  >
                    ✕ Remove image (use classic design)
                  </button>
                )}
                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                  {(['1414 / 1000', '1000 / 1414'] as const).map((ar) => (
                    <button
                      key={ar}
                      onClick={() => setTpl((p) => ({ ...p, aspectRatio: ar }))}
                      style={{
                        flex: 1, padding: '8px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                        border: '1.5px solid', borderColor: tpl.aspectRatio === ar ? '#7B1A2D' : '#DDD',
                        background: tpl.aspectRatio === ar ? 'rgba(123,26,45,0.06)' : '#fff',
                        color: tpl.aspectRatio === ar ? '#7B1A2D' : '#666',
                      }}
                    >
                      {ar === '1414 / 1000' ? '▭ Landscape' : '▯ Portrait'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Field selector */}
              <div style={{ fontSize: 12, fontWeight: 700, color: '#888', textTransform: 'uppercase', marginBottom: 8 }}>Choose a field to position</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
                {(Object.keys(FIELD_LABELS) as (keyof CertTemplateSettings['fields'])[]).map((key) => (
                  <button
                    key={key}
                    onClick={() => setActiveField(key)}
                    style={{
                      padding: '10px 8px', borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                      border: '1.5px solid', borderColor: activeField === key ? '#7B1A2D' : '#DDD',
                      background: activeField === key ? '#7B1A2D' : '#fff',
                      color: activeField === key ? '#fff' : '#555',
                    }}
                  >
                    {FIELD_LABELS[key]}
                  </button>
                ))}
              </div>

              {/* Sliders for the active field */}
              {slider('↕ Down the page (top)', f.top, 0, 95, (v) => updateField(activeField, { top: v }))}
              {slider('↔ From the left', f.left, 0, 95, (v) => updateField(activeField, { left: v }))}
              {slider('⬌ Box width', f.width, 5, 100, (v) => updateField(activeField, { width: v }))}
              {slider('🔠 Text size', f.size, 8, 60, (v) => updateField(activeField, { size: v }), 'px')}

              <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'flex', gap: 6, alignItems: 'center', cursor: 'pointer' }}>
                  <input type="checkbox" checked={f.bold} onChange={(e) => updateField(activeField, { bold: e.target.checked })} />
                  Bold
                </label>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'flex', gap: 6, alignItems: 'center' }}>
                  Color
                  <input type="color" value={f.color} onChange={(e) => updateField(activeField, { color: e.target.value })} style={{ width: 36, height: 26, border: 'none', cursor: 'pointer' }} />
                </label>
                <select
                  value={f.align}
                  onChange={(e) => updateField(activeField, { align: e.target.value as CertField['align'] })}
                  style={{ fontSize: 12, padding: '6px 8px', borderRadius: 8, border: '1.5px solid #DDD' }}
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  width: '100%', padding: '14px', borderRadius: 30, fontSize: 15, fontWeight: 700,
                  background: saving ? '#999' : '#7B1A2D', color: '#fff', border: 'none', cursor: 'pointer',
                }}
              >
                {saving ? 'Saving...' : '💾 Save Template'}
              </button>
              <button
                onClick={() => setTpl(DEFAULT_CERT_TEMPLATE)}
                style={{
                  width: '100%', padding: '10px', borderRadius: 30, fontSize: 13, fontWeight: 600, marginTop: 8,
                  background: '#fff', color: '#888', border: '1.5px solid #DDD', cursor: 'pointer',
                }}
              >
                Reset to default design
              </button>
            </div>

            {/* ============ LIVE PREVIEW ============ */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#888', textTransform: 'uppercase', marginBottom: 8 }}>
                Live preview (sample data) — the selected field has a dashed outline
              </div>
              <div
                style={{
                  position: 'relative',
                  aspectRatio: tpl.aspectRatio,
                  fontFamily: 'Georgia, "Times New Roman", serif',
                  color: '#1A1A2A',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                  borderRadius: 6,
                  overflow: 'hidden',
                  ...(tpl.backgroundImage
                    ? { backgroundImage: `url(${tpl.backgroundImage})`, backgroundSize: '100% 100%', backgroundRepeat: 'no-repeat', backgroundColor: '#fff' }
                    : { background: '#FFFDF8', border: '10px double #7B1A2D' }),
                }}
              >
                {!tpl.backgroundImage && (
                  <>
                    <div style={{ position: 'absolute', top: '8%', width: '100%', textAlign: 'center', fontSize: 13, letterSpacing: '0.35em', textTransform: 'uppercase', color: '#7B1A2D', fontWeight: 700 }}>MCU Institute</div>
                    <div style={{ position: 'absolute', top: '15%', width: '100%', textAlign: 'center', fontSize: 34, fontWeight: 700 }}>Certificate of Completion</div>
                    <div style={{ position: 'absolute', top: '28%', left: '45%', width: '10%', height: 2, background: '#E5A52E' }} />
                    <div style={{ position: 'absolute', top: '34%', width: '100%', textAlign: 'center', fontSize: 14, color: '#666' }}>This is to certify that</div>
                    <div style={{ position: 'absolute', top: '52%', width: '100%', textAlign: 'center', fontSize: 14, color: '#666' }}>has successfully completed the program</div>
                    <div style={{ position: 'absolute', top: '80%', width: '100%', textAlign: 'center', fontSize: 26 }}>🎓</div>
                  </>
                )}
                {(Object.keys(FIELD_LABELS) as (keyof CertTemplateSettings['fields'])[]).map((key) => (
                  <div
                    key={key}
                    onClick={() => setActiveField(key)}
                    style={{
                      ...fieldStyle(tpl.fields[key]),
                      cursor: 'pointer',
                      outline: activeField === key ? '2px dashed #2EC4B6' : 'none',
                      outlineOffset: 2,
                      fontStyle: key === 'name' ? 'italic' : undefined,
                    }}
                  >
                    {SAMPLE[key]}
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 12, color: '#999', marginTop: 10 }}>
                💡 Tip: click any text on the preview to select that field, then use the sliders. Nothing is applied until you press Save.
              </p>
            </div>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
