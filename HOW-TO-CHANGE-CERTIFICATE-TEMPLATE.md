# How to Use Your Own Certificate Template (No Developer Needed)

The certificate that appears in **Student CRM → View Certificate** is drawn by code in ONE file:

```
app/admin/students/page.tsx   →  the block starting with  id="certificate-print-area"
```

The student's **name, course, certificate number and issue date** are filled in
automatically from the database. You NEVER type them. They appear in the code as:

```
{certToPrint.recipientname}      ← student name
{certToPrint.coursename}         ← course name
{certToPrint.certificatenumber}  ← e.g. MCU-2026-000001
{certToPrint.issuedate}          ← date of issue
```

⚠️ TWO RULES — breaking these breaks the system:
1. Never rename or delete those four `{certToPrint.xxx}` expressions.
2. Never change `id="certificate-print-area"` (the Print button needs it).

Everything else (colors, text, layout, background) is safe to change.

---

## Putting your company template image behind the text

You need the template as a **PNG or JPG**, ideally blank in the spots where
the name / course / number / date should go.

### Step 1 — Upload the image to the website files
1. Go to github.com/MCUniverstiy/MCU
2. Open the `public` folder
3. Click **Add file → Upload files**
4. Upload your image, name it exactly: `certificate-template.png`
5. Click **Commit changes**

### Step 2 — Point the certificate at your image
1. In GitHub open `app/admin/students/page.tsx` and click the ✏️ pencil (Edit)
2. Press Ctrl+F in the browser and search for: `certificate-print-area`
3. In the `style={{ ... }}` right below it, REPLACE these lines:

   ```
   background: '#FFFDF8', padding: '56px 64px', borderRadius: 6,
   border: '10px double #7B1A2D', textAlign: 'center', position: 'relative',
   ```

   WITH:

   ```
   backgroundImage: 'url(/certificate-template.png)',
   backgroundSize: '100% 100%',
   aspectRatio: '1414 / 1000',
   textAlign: 'center', position: 'relative', padding: '56px 64px',
   ```

   (`1414 / 1000` = A4 landscape shape. If your template is portrait use `1000 / 1414`.)

4. Optional: delete the decorative lines you don't need anymore — the
   "MCU Institute" heading, the "Certificate of Completion" title, the gold
   divider line, the 🎓 emoji — IF your template image already contains them.
   Delete whole `<div> ... </div>` blocks only, and never the four
   `{certToPrint.xxx}` ones.

5. Scroll down, **Commit changes**. The live site updates itself in ~2 minutes
   (Vercel redeploys automatically on every commit).

### Step 3 — Move the text onto the right spots
Each text block can be pinned to an exact position on the template by adding
`position: 'absolute'` with percentages. Example — put the student name 45%
down the page:

```
<div style={{ position: 'absolute', top: '45%', left: 0, width: '100%',
              textAlign: 'center', fontSize: 30, fontWeight: 700, color: '#7B1A2D' }}>
  {certToPrint.recipientname}
</div>
```

- `top` = distance from the top (0% = top edge, 50% = middle, 90% = near bottom)
- `fontSize` = text size, `color` = hex color code (google "color picker")
- Repeat the same idea for coursename / certificatenumber / issuedate

Then: commit → wait 2 min → open View Certificate → check → adjust the
percentages → commit again. Two or three rounds is normal.

---

## If you break something
Every change is saved in GitHub. Open the file → **History** (top right) →
pick the version that worked → copy it back (or use "Revert"). Nothing is
ever lost.

## Checking the result
Student CRM → expand any student with a certificate → **View Certificate** →
**Print / Save as PDF**. The print button only prints the certificate, nothing
else on the page.
