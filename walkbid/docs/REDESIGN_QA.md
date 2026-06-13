# WalkBid — Redesign QA ("Asphalt & Stakes")

_Branch `claude/walkbid-phase-0-audit-3c83rm`. Verified after Steps A→B→C._

Legend: ✅ verified here · 🟡 needs on-device eyeball

## Part C acceptance checklist

1. **Zero orange / `#FF6A00` / `safety` in `src/`.** ✅ `grep -rniE "safety|#FF6A00|orange" src` → **NONE**. Orange retired from the UI entirely (the PDF brand accent is now `COLORS.brand` deep-green; the `safety` token and key are deleted).
2. **All color from tokens, no stray hex in components.** ✅ The only literal colors left are `SignaturePad`'s canvas (`#ffffff`/`#0E1013`) — required black-on-white for clean PDF embedding — documented in the audit. Everything else uses Tailwind tokens / `:root` vars.
3. **No truncated nav.** ✅ Pipeline pills replaced by a single **stage chip → bottom-sheet picker** (`StagePicker`); tab strip is **`ScrollTabs`** with edge-fade mask + active-tab auto-centered (`scrollIntoView inline:center`). Verified at 430px: active tab centered, both edges fade, nothing hard-cut.
4. **Exactly one JobMoneyBar per screen.** ✅ Removed the duplicate from `PaymentsTab`; header is the single source. Job cards each show their own (one per card, by design).
5. **Price book: one banner + amber seed dots, no per-row label.** ✅ Dismissible "starter prices" banner (persisted in `localStorage`); amber dot before price on un-edited seed items; "edit your prices" removed from every row.
6. **Money uses tabular nums + `MoneyText`; screen totals largest.** ✅ `text-money-hero` (30px Archivo 800) on Estimate Total, Contract total, Change-orders Updated total; `.tnum` throughout. Money is the biggest element on each money card.
7. **Contract integrity still passes; SHA copies.** ✅ A freshly signed contract renders **"Integrity verified"** after the PDF header recolor (hash computed on the exact new bytes). Fingerprint is in the **mono** font with **tap-to-copy** (`navigator.clipboard` + light haptic + "Fingerprint copied" toast). Failed state now uses **danger red** (was amber).
8. **Contrast / touch targets.** ✅ structural — `ink #F2F5F1` on `bg #0A100D` ≈ 17:1; `muted #9AA79E` on surfaces ≈ 6:1; buttons/inputs `min-h-touch` (48px); FAB 56px; stage chip & pills ≥ 32px tall but tap area padded. 🟡 outdoor-brightness eyeball.
9. **`tsc --noEmit` + `npm run build` clean.** ✅ after every step; no console errors on the happy path of each tab (screens re-rendered headless without errors).
10. **Offline unaffected.** ✅ No service/Dexie/AI/offline-queue code touched. PDF **generation pipeline** unchanged — only color constants + the header band layout. Full flow (estimate → contract → sign → CO → payments → proof) exercised by the demo seed via the real pipelines.

## What changed, by screen (before → after)
- **Project header:** tall + overflowing pills/tabs → tightened (address · stage-chip on one row, then JobMoneyBar), brand grain finish, `ScrollTabs`.
- **Estimate:** truncated names → 2-line clamp; loud orange "Tax & markup" → outlined chip; markup note → amber micro-pill; Total → hero; actions Add line/Voice (secondary) + Share proposal (primary green).
- **Contract:** re-toned to green; AUDIT labels as eyebrows; mono hash + tap-to-copy; verified=green / failed=danger; total in its own card.
- **Change orders:** Updated total → hero + green delta badge; New CO primary green; CO card Share = secondary; punchier empty copy.
- **Payments:** duplicate bar removed; Mark paid = primary green; Request = secondary; paid → green pill + muted "Undo paid".
- **Price book:** banner + amber dots; eyebrow group headers; H2 row names.
- **Bottom nav:** active item + center FAB → green.
- **PDF:** header is now a full-width deep-green band with white company name + doc title; body stays black-on-white for print; TOTAL/section accents green. Hash re-verify ✅.

## Beyond the list (fixed while here)
- Added a real **mono** font family (the SHA had no configured `mono` → fell back).
- Added **card elevation** (inset top-highlight + drop) and softer **radii** (16/12/20) for depth.
- Added the **grain header** asset + `.header-grain` finish that the old build referenced (`.grain`) but never defined.
- Tightened money type scale (`md`/`lg`/`hero`) so totals lead.

## Known follow-ups (not blocking)
- 🟡 On-device contrast/brightness pass and PDF rendering in iOS Files/Adobe.
- Self-hosted Archivo/Inter still deferred (system fallback) per the original privacy posture.
