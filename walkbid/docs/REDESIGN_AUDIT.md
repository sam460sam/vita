# WalkBid — Redesign Audit (Phase 0)

_Theme + orange audit for the "Asphalt & Stakes" visual pass. Branch
`claude/walkbid-phase-0-audit-3c83rm`. No code changed yet — this is the map._

> Scope guardrails confirmed: this pass re-skins only. Dexie schema, services,
> AI layer, PDF **generation pipeline** and offline queue stay untouched (PDF
> **color constants** may change). Every new label stays in i18n.

---

## (a) Where color is defined today

| Location | What |
|---|---|
| `tailwind.config.js:9–19` | The 9 palette tokens: `asphalt #0E1013`, `graphite #16191E`, `steel #262B33`, `chalk #F2F3F5`, `dust #8A9099`, **`safety #FF6A00`**, **`signal #FFC400`**, `go #22C55E`, `risk #EF4444` |
| `tailwind.config.js:20–47` | Single `10px` radius (`DEFAULT/card/btn`), `display`/`sans` fonts, one `money` text size (28px), `touch` 48px, `shadow.card`/`shadow.bar` |
| `src/styles/index.css:8–24` | `color-scheme: dark`, body `background:#0e1013` (hardcoded dup of asphalt), `.grain`, `.tnum`, scrollbar/signature helpers |
| Inline hex (legit, dynamic) | `src/ui/SignaturePad.tsx` `#ffffff`/`#0E1013` (canvas must be black-on-white for PDF embed); `src/ui/MilestoneBar.tsx:41` `style={{width}}` (proportional — keep); `SettingsPage.tsx:62` `#438F829` is a **license placeholder string**, not a color |
| `src/services/pdf/PdfBuilder.ts:8–15` | PDF `COLORS` incl. `safety: rgb(1,0.416,0)` — cosmetic, restyle allowed |

There is **no `:root` CSS-var token layer** for brand colors yet (only safe-area
vars). The redesign adds one.

### Token migration map (old → new)
| Old | Count* | New role | New token |
|---|---|---|---|
| `asphalt` | 27 | app background | `bg #0A100D` |
| `graphite` | 10 | cards | `surface #111A15` |
| `steel` | 45 | **split**: borders → `hairline #233029`; raised fills (inputs, secondary btn, option tiles) → `surface-2 #18241D` |
| `chalk` | 44 | primary text | `text #F2F5F1` |
| `dust` | 108 | secondary text → `text-muted #9AA79E`; captions → `text-faint #5E6D64` |
| **`safety`** | 29 | **RETIRE** — see (b) | mostly `accent #2FBE7A` |
| **`signal`** | 45 | at-risk/pending/attention | `attention #E6A23C` |
| `go` | 37 | paid/signed/go | `paid`=`accent #2FBE7A` |
| `risk` | 40 | overdue/disputed/destructive | `danger #DC5A4B` |

*Counts are raw `bg-/text-/border-…` matches across `src/`.

---

## (b) Every orange (`safety`) usage and the role it plays

Orange is doing **six different jobs** — exactly the "means five things → means
nothing" problem. Inventory with the correct new mapping:

| # | File:line | Current role | New |
|---|---|---|---|
| 1 | `ui/Button.tsx:7` | `primary` CTA fill | **`accent` green**, text `on-accent` |
| 2 | `ui/Button.tsx:11` (`signal` variant) | faux-CTA for **sign** actions (amber) | merge into **`primary` green** (signing is the positive primary action) |
| 3 | `ui/VoiceCapture.tsx:60` | mic "Hold to talk" button | `accent` green (idle), `danger` (listening) |
| 4 | `ui/Badge.tsx:9,26,27` | status tone `signed`/`in_progress` | `signed`→green; `in_progress`→**amber** attention chip |
| 5 | `ui/MilestoneBar.tsx:9` | `requested` segment | `brand #1C6E47` (per JobMoneyBar spec) |
| 6 | `app/TabBar.tsx:14,38` | active tab text + center **FAB** | `accent` green |
| 7 | `app/QuickAdd.tsx:60` | quick-action icons | `accent` green |
| 8 | `app/ErrorBoundary.tsx:26` | "Back to Jobs" button | `accent` green |
| 9 | `features/projects/tabs/ProofTab.tsx:39` | proof shield icon | `accent` green |
| 10 | `features/projects/tabs/PaymentsTab.tsx:17` | `requested` payment tone | `brand`/`attention` (requested = brand-green outline pill) |
| 11 | `features/projects/tabs/EstimateTab.tsx:50` | "% Tax & markup" chip text | quiet **outlined** chip (`hairline` border, `text`) |
| 12 | `features/projects/ProjectDetailPage.tsx:97` | active tab underline | `accent` green 2px |
| 13 | `features/estimate/QtySheet.tsx:91` | "Add area" link | `accent` green |
| 14 | `ui/Field.tsx:6` | input focus border | `accent` green |
| 15 | PDF `sections.ts:25`, `estimatePdf:42`, `contractPdf:40`, `proofPdf:119`, `changeOrderPdf:37` | brand rule / TOTAL / section headers | `brand #1C6E47` green band (white company name) |

### `signal` (amber/yellow) usages — re-home to `attention` or `danger`
- **Keep as attention (amber):** `MilestoneBar pending` (`MilestoneBar.tsx:11`),
  `Badge quoted` (`Badge.tsx:25`), `JobCard` money-at-risk pill (`JobCard.tsx:37`),
  `DraftLinesEditor needs_pricing` (`DraftLinesEditor.tsx:19,45`),
  `ChangeOrdersTab pending_signature` (`ChangeOrdersTab.tsx:20`),
  `ProjectDetailPage` deposit "don't break ground" banner (`:84`),
  `SettingsPage` legal-caution heading (`:167`).
- **Re-map to danger (red):** `ContractTab` integrity-**failed** border/icon
  (`ContractTab.tsx:50,52`) — a failure is "wrong," not "attention."
- **Toast `signal` tone** (`Toast.tsx:21`) → `attention`; several error toasts
  (`'Draft failed'`, `'Summarize failed'`) are genuinely errors → consider
  `danger`, but keeping them `attention` is acceptable (non-blocking).
- **Remove entirely:** `PriceBookPage.tsx:61` per-row "edit your prices" → single
  dismissible banner + amber seed-dot (Part B3).

---

## (c) Shared components (fix-once surfaces)

All live in `src/ui/` (barrel `src/ui/index.ts`):

| Component | Exports | Redesign action |
|---|---|---|
| `Button.tsx` | `Button`, `IconButton`, `BottomBar` | variants → `primary`(green)/`secondary`(surface-2)/`danger`; **drop `signal`/`ghost`-as-CTA**; 12px radius, pressed `accent-press`, keep haptic |
| `Card.tsx` | `Card`, `CardHeader` | 16px radius + elevation (inset top-highlight + drop shadow) |
| `Badge.tsx` | `Pill`, `StatBadge`, `statusTone` | status-driven tones on new palette; `paid/signed`→green, `pending`→neutral, `requested/sent`→brand outline, `late`→amber, `disputed`→danger |
| `MilestoneBar.tsx` | `MilestoneBar` | **evolve → `JobMoneyBar`**: proportional segments, 8px tall, 4px gaps, 999px, state colors (paid `accent`/requested `brand`/pending `attention`/overdue `danger`). Render **once per screen** |
| `MoneyText.tsx` | `MoneyText`, `MoneyDelta` | Archivo 800 tabular; sizes `hero`/`lg`/`md`; `hero` for screen totals |
| `Field.tsx` | `Field`, `Label`, `Input`, `Textarea`, `Select` | inputs `surface-2` + `hairline`, focus `accent`, 12px radius |
| `Sheet.tsx` | `Sheet` | 20px top radius, `surface-2`, `scrim` |
| `Toast.tsx` | `Toast`, `useToast` | tones on new palette |
| `EmptyState.tsx` | `EmptyState` | primary green CTA |
| `Photo.tsx` | `PhotoThumb`, `PhotoStrip` | border `hairline` |
| `VoiceCapture.tsx` | `VoiceCapture` | mic button green/danger |
| `SignaturePad.tsx` | `SignaturePad` | **leave canvas colors** (black-on-white for PDF); border `hairline` only |

**Not a shared component (needs new build):** the **TabBar strip** inside
`ProjectDetailPage` (tabs Estimate·Contract·…·Proof) is inline — extract a
`ScrollTabs` component with edge fades + auto-center active. The **stage pills**
in the same header are also inline and overflow — replace with a single
current-stage chip + bottom-sheet picker.

---

## Additional issues found (beyond pure color)

1. **Duplicate `JobMoneyBar` on Payments** — rendered in the project header
   (`ProjectDetailPage.tsx:70`) **and** again in `PaymentsTab.tsx:50`. Remove the
   tab-body one.
2. **Nav overflow (two places):** the stage pills row and the tab strip in
   `ProjectDetailPage` both `overflow-x-auto` with no edge affordance → "D…",
   "Pa…" truncation. Fix per Part B2/B3.
3. **Truncated line items:** `EstimateTab` line descriptions are single-line
   truncated → allow 2 lines / 14px.
4. **Repetition clutter:** "edit your prices" on every price-book row.
5. **Flat radius/elevation:** single 10px square radius, `shadow.card` is a flat
   `0 1px 2px` — no depth. Move to 16px + inset-highlight elevation.
6. **No grain/gradient header** despite `.grain` existing — header is flat. Add
   `src/assets/grain.png` + brand gradient.
7. **No mono font** for the SHA-256 fingerprint (currently `font-mono` utility,
   but Tailwind has no `mono` family configured → falls back). Add a real mono.
8. **Money hierarchy weak:** `MoneyText` has one `money` size; totals and line
   items read at similar weight. Add `hero/lg/md` scale.

---

## Proposed execution order (after approval)
1. **Tokens** — new palette in `tailwind.config` + `:root` vars; font scale;
   radii/elevation/shadows; `grain.png`; mono. Migrate `index.css`.
2. **Shared components** — Button, Card, Badge, MoneyText, Field, Sheet, Toast,
   EmptyState, Photo, VoiceCapture; new `JobMoneyBar`, `ScrollTabs`, stage-chip.
3. **Screen-by-screen** — Project header, Estimate, Contract, Change orders,
   Payments (de-dupe bar), Price book (banner+dots), bottom nav, then PDF header
   color + re-verify a fresh signed PDF's hash.

One commit per step; `tsc --noEmit` + `npm run build` clean each time;
`docs/REDESIGN_QA.md` at the end.

**STOP — awaiting approval before changing any code.**
