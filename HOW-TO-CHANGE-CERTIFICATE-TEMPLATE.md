# How to Change the Certificate Template (No Developer Needed)

The certificate (Student CRM → View Certificate) auto-fills the student's
**name, course, certificate number and issue date** from the database.
You never type those — you only control the DESIGN and WHERE the text sits.

Everything you need to edit is in ONE clearly-marked settings block:

```
File:  app/admin/students/page.tsx
Block: "CERTIFICATE TEMPLATE SETTINGS — EDIT THIS BLOCK ONLY"
       (near the top of the file, you can't miss it)
```

You do all edits on the GitHub website (github.com/MCUniverstiy/MCU):
open the file → click the ✏️ pencil → edit → **Commit changes** →
the live site updates itself in ~2 minutes.

---

## A. Swap in a new template image

1. Design the certificate anywhere (Canva, Photoshop…), export as PNG,
   leaving blank areas where name / course / number / date will go.
2. GitHub → `public` folder → **Add file → Upload files** → upload it,
   e.g. `certificate-template.png` → Commit.
   (Replacing an old one? Delete the old file first, upload the new one
   with the SAME file name — then you can skip step 3.)
3. In the settings block set:

   ```
   backgroundImage: '/certificate-template.png',
   ```

   Portrait template? Also change `aspectRatio` to `'1000 / 1414'`.

## B. Move ALL the text positions for a new design

In the settings block, each of the 4 fields has one line of numbers:

```
name:   { top: 42, left: 0,  width: 100, size: 30, bold: true,  color: '#7B1A2D', align: 'center' },
course: { top: 58, left: 0,  width: 100, size: 20, bold: true,  color: '#1A1A2A', align: 'center' },
certNo: { top: 84, left: 6,  width: 40,  size: 12, bold: true,  color: '#1A1A2A', align: 'left'   },
issued: { top: 84, left: 54, width: 40,  size: 12, bold: true,  color: '#1A1A2A', align: 'right'  },
```

What each number means:

| Setting | Meaning |
|---|---|
| `top`   | how far DOWN the page, in % (0 = top edge, 50 = middle, 100 = bottom) |
| `left`  | how far RIGHT the text box starts, in % |
| `width` | how wide the text box is, in % |
| `size`  | text size |
| `bold`  | `true` or `false` |
| `color` | hex color code — google "color picker" to get one |
| `align` | `'left'`, `'center'` or `'right'` (inside the text box) |

So "move the name lower and to the left" = change its `top` and `left`
numbers. That's all repositioning ever is.

Workflow: change numbers → Commit → wait 2 min → View Certificate →
check → adjust → Commit again. Two or three rounds is normal.

## C. If your image already contains headings

If the template image has its own "Certificate of Completion" title etc.,
the built-in decorative text disappears automatically as soon as
`backgroundImage` is set — nothing else to do.

---

## Rules (breaking these breaks the system)
1. Do not touch anything OUTSIDE the settings block.
2. Do not rename the four field names (name / course / certNo / issued).
3. Do not change `id="certificate-print-area"` elsewhere in the file.

## If something goes wrong
GitHub saves every version. Open the file → **History** → pick the last
working version → Revert. Nothing is ever lost.
