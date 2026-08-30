# CV — Samuele Gubert

Three deliverables, one set of content.

| File | Use it for |
| --- | --- |
| `cv-onepage.html` | **Primary CV.** Single A4 page. Use this by default for applications and emails. |
| `cv-full.html` | Long version, 2 A4 pages. Use when the role wants the full work history, or when a form allows a longer CV. |
| `cv-ats.txt` | Plain text, one column. Paste into portals that parse automatically (Workday, Greenhouse, Lever) where a designed PDF gets mangled. Carries the **full** substance, same as `cv-full.html` — plain text has no page limit, and more parseable detail is an advantage there. |

## What differs between the one-page and full versions

Both versions group work into two blocks: `Experience` (indie work, plus the two roles
that say something for a tech application) and `Other Experience` (the manual roles).
Each block is in reverse chronological order. The blocks are not one continuous
timeline — `Other Experience` opens with the most recent job of all, AD Nooren — which
is why it is labelled "Other" rather than "Earlier": grouping by relevance keeps the
indie work at the top of page one, where it does its job.

The one-pager compresses rather than cuts:

- Indie experience is intact, with both summary bullets and all four projects.
- Real Estate Agent keeps one bullet, Altar Decks two: client ownership and the
  promotion to crew coordination are the two non-tech things worth saying.
- The three remaining manual roles are one line each in `Other Experience`, no bullets.
- Skills are four grouped rows; Education, Languages and Mobility share one section.

Nothing is invented in either version, and no fact is present in one that is absent
from `cv-ats.txt`.

## Exporting the PDF

Open the file in Chrome, Edge or Safari, then:

1. `Cmd/Ctrl + P`
2. Destination: **Save as PDF**
3. Paper size: **A4**
4. Margins: **None** (the file draws its own margins)
5. **Background graphics: ON** (otherwise the accent rules disappear)
6. Scale: **100%** — do not use "Fit to page"

Result: exactly 1 page from `cv-onepage.html`, exactly 2 from `cv-full.html`, nothing
cropped, nothing split across a page break.

## Notes

- No runtime dependencies: no CDN, no web fonts, no remote images. Both files work
  offline and will still render years from now.
- Typography falls back through Inter → Geist → system sans. Both layouts were measured
  in headless Chromium against the widest fallback font available, so they cannot
  overflow on a machine that has none of them installed. Verified headroom at the
  bottom of the sheet: ~14 mm on the one-pager, ~18 mm and ~41 mm on the two full pages.
  With Inter actually installed there is more room, not less.
- Page breaks are explicit: each `<section class="sheet">` is one A4 page. That is why
  `@page { size: A4; margin: 0 }` still yields correct margins on the second page of
  `cv-full.html` — free-flowing content would only have margined the first page.
- Single accent colour, defined once as `--accent`. Change that one value to recolour
  the document. It is dark enough to stay legible printed in black and white.

## Still to fill in

Placeholders are marked in the HTML with `class="todo"` (accent colour, dashed underline)
and in the text version with `[TO FILL IN: ...]`. Search for either and replace:

- App Store URL for **Vyta**. In the HTML the marker sits on the app name: replace
  `<dt>Vyta <span class="todo">link</span></dt>` with `<dt><a href="URL">Vyta</a></dt>`.
  In `cv-ats.txt` replace `[TO FILL IN: App Store URL]` with the plain URL.

Fourth Night has no link by design — it is described as currently in development, not
as published.

One date to tighten, not a placeholder: **Real Estate Agent (Verde Casa)** is recorded
as `2023 - 2024`, year granularity only. Read literally it can overlap Altar Decks
(ends April 2023, in Australia) at one end and Warehouse Assistant (starts April 2024)
at the other. Month granularity — say `May 2023 - Mar 2024` — removes both ambiguities.
Every other date in the CV is month-precise and free of overlap, apart from the indie
work, which runs alongside employment by nature.

Once everything is filled in, delete the `.todo` rule from the stylesheet so no trace of
it remains.
