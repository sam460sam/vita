# CV — Samuele Gubert

Two deliverables, one source of truth for the content.

| File | Use it for |
| --- | --- |
| `cv.html` | The designed CV. Open in a browser, print to PDF, attach to direct applications and emails. |
| `cv-ats.txt` | Plain text, one column. Paste into portals that parse automatically (Workday, Greenhouse, Lever) where a designed PDF gets mangled. |

## Exporting the PDF

Open `cv.html` in Chrome, Edge or Safari, then:

1. `Cmd/Ctrl + P`
2. Destination: **Save as PDF**
3. Paper size: **A4**
4. Margins: **None** (the file draws its own margins)
5. **Background graphics: ON** (otherwise the accent rules disappear)
6. Scale: **100%** — do not use "Fit to page"

Result: exactly 2 pages, nothing cropped, nothing split across the page break.

## Notes

- No runtime dependencies: no CDN, no web fonts, no remote images. The file works offline
  and will still render years from now.
- Typography falls back through Inter → Geist → system sans. The layout is sized so it fits
  on two A4 pages even with the widest fallback font, so it will not overflow on a machine
  that has none of them installed.
- Single accent colour, defined once as `--accent` in the stylesheet. Change that one value
  to recolour the whole document. It is dark enough to stay legible printed in black and white.
- Page breaks are explicit: each `<section class="sheet">` is one A4 page. To move an entry
  between pages, move the `<article class="entry">` block.

## Still to fill in

Placeholders are marked in the HTML with `class="todo"` (accent colour, dashed underline) and
in the text version with `[TO FILL IN: ...]`. Search for either and replace:

- GitHub / X / portfolio URL in the header
- Site Coordinator & Trainer (Australia) — start and end dates
- Real Estate Agent — company name, start and end dates

Once filled in, delete the `.todo` rule from the stylesheet if you want no trace of it.
