# How to Change the Certificate Template (No Developer Needed)

The certificate (Student CRM → View Certificate) auto-fills the student's
**name, course, certificate number and issue date** from the database.
You never type those — you only control the DESIGN and WHERE the text sits.

---

## ⭐ The easy way — the built-in visual editor

Log in as an admin → click your name (top right) → **🖼 Certificate Template**.

On that page you can do everything yourself, with a live preview:

1. **Upload** your template image (PNG/JPG) — or remove it to go back to the
   classic built-in design
2. Pick **Landscape / Portrait** to match your image
3. Select a field — **Student Name / Course / Certificate No. / Date of
   Issue** — using the buttons, or just click the text on the preview
4. Drag the **sliders**: how far down the page, from the left, box width,
   text size. Tick **Bold**, pick a **color**, choose the alignment
5. Click **💾 Save Template**

From that moment, every certificate opened in Student CRM uses the new
design — with each student's real details still filled in automatically.
No code. No GitHub. Applies instantly (no waiting for a deploy).

**One-time setup (already done if the editor works):** run
`supabase/template.sql` once in the Supabase SQL Editor. It creates the
settings table and the image storage bucket the editor uses.

Made a mess? Click **Reset to default design** and Save.

---

## The backup way — editing the fallback in code

If the database has no saved template (or the editor page is unavailable),
the certificate falls back to defaults defined in:

```
File: lib/certTemplate.ts   →   DEFAULT_CERT_TEMPLATE
```

Each field has one line of numbers you can edit on the GitHub website
(✏️ pencil → edit → Commit; the site redeploys itself in ~2 minutes):

| Setting | Meaning |
|---|---|
| `top`   | how far DOWN the page, in % (0 = top, 50 = middle, 100 = bottom) |
| `left`  | how far RIGHT the text box starts, in % |
| `width` | how wide the text box is, in % |
| `size`  | text size |
| `bold`  | `true` or `false` |
| `color` | hex color code — google "color picker" |
| `align` | `'left'`, `'center'` or `'right'` |

## Rules (breaking these breaks the system)
1. Don't rename the four fields (name / course / certNo / issued).
2. Don't change `id="certificate-print-area"` in
   `app/admin/students/page.tsx` (the Print button needs it).
3. Prefer the visual editor — only touch code if you must.

## If something goes wrong
- Visual editor: **Reset to default design** → Save.
- Code changes: GitHub keeps every version — open the file → **History** →
  revert to the last working version. Nothing is ever lost.
