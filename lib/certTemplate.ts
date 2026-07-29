// Shared certificate template settings + helpers.
// The design is stored in the `certtemplate` table (single row, id = 1)
// and edited visually at /admin/template — no code editing needed.

export interface CertField {
  top: number;      // % from top
  left: number;     // % from left
  width: number;    // % width of text box
  size: number;     // font size px
  bold: boolean;
  color: string;    // hex
  align: 'left' | 'center' | 'right';
}

export interface CertTemplateSettings {
  backgroundImage: string;   // '' = classic built-in design
  aspectRatio: string;       // '1414 / 1000' landscape, '1000 / 1414' portrait
  fields: {
    name: CertField;
    course: CertField;
    certNo: CertField;
    issued: CertField;
  };
}

export const DEFAULT_CERT_TEMPLATE: CertTemplateSettings = {
  backgroundImage: '',
  aspectRatio: '1414 / 1000',
  fields: {
    name:   { top: 42, left: 0,  width: 100, size: 30, bold: true, color: '#7B1A2D', align: 'center' },
    course: { top: 58, left: 0,  width: 100, size: 20, bold: true, color: '#1A1A2A', align: 'center' },
    certNo: { top: 84, left: 6,  width: 40,  size: 12, bold: true, color: '#1A1A2A', align: 'left' },
    issued: { top: 84, left: 54, width: 40,  size: 12, bold: true, color: '#1A1A2A', align: 'right' },
  },
};

export const fieldStyle = (f: CertField): React.CSSProperties => ({
  position: 'absolute',
  top: `${f.top}%`,
  left: `${f.left}%`,
  width: `${f.width}%`,
  fontSize: f.size,
  fontWeight: f.bold ? 700 : 400,
  color: f.color,
  textAlign: f.align,
});

// Merge whatever is stored in the DB with defaults (survives missing keys)
export function mergeTemplate(raw: unknown): CertTemplateSettings {
  const r = (raw || {}) as Partial<CertTemplateSettings>;
  return {
    backgroundImage: r.backgroundImage ?? DEFAULT_CERT_TEMPLATE.backgroundImage,
    aspectRatio: r.aspectRatio ?? DEFAULT_CERT_TEMPLATE.aspectRatio,
    fields: {
      name: { ...DEFAULT_CERT_TEMPLATE.fields.name, ...(r.fields?.name || {}) },
      course: { ...DEFAULT_CERT_TEMPLATE.fields.course, ...(r.fields?.course || {}) },
      certNo: { ...DEFAULT_CERT_TEMPLATE.fields.certNo, ...(r.fields?.certNo || {}) },
      issued: { ...DEFAULT_CERT_TEMPLATE.fields.issued, ...(r.fields?.issued || {}) },
    },
  };
}
