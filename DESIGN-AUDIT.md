# Vyta — Design Audit (elevation pass)

> Scope: visual + interaction polish only. No brand change, no data/logic/StoreKit/
> Dexie/Stella changes, no analytics/network, fully offline. Adapted to Vyta's
> **actual** identity: warm cream paper + botanical green (Vio), not "cream/gold".

## Inventory
- **Tokens:** `src/styles/index.css` (`:root` CSS variables — surfaces, ink, lines,
  module accents/tints/chips, states, primary, hero gradients; light + `.dark`)
  and `tailwind.config.js` (radius `card/btn/pill`, `boxShadow card/chip/fab/nav/sheet`,
  font `sans/serif`, safe-area spacing, durations).
- **Shared UI:** `src/ui/*` (Card, Button, Sheet, ProgressRing, VioCompanion, Icon,
  EmptyState, Field, …), `src/app/*` (PageHeader, Screen, TabBar, Sidebar).
- **Screens:** Home (`/oggi` = HomeScreen), Abitudini, Acqua, Test/Personalità,
  Salute, Peso, BMI, Progetti, Note, Diario, Obiettivi, Finanze, Calendario, Recap,
  Premi, Altro, Impostazioni, Onboarding, Paywall, Splash.

## Ranked issues (worklist)
1. **Flat surfaces / single-layer shadows** — cards read like CSS, not paper. → *fixed:* two-layer warm shadows.
2. **Cream has no material** — pure flat fill is the "AI default" tell. → *fixed:* subtle archival paper grain under the UI (bundled SVG noise, offline).
3. **Web-app smells** — blue tap-highlight flash, UI text selectable, no keyboard focus ring. → *fixed:* tap-highlight off, no-select on chrome, on-brand `:focus-visible`.
4. **Motion accessibility** — animations not globally gated. → *fixed:* global `prefers-reduced-motion` guard.
5. **Mixed corner radii** — new screens mix 26/22/20/16px; token is `card:26 / btn:16`. → *DESIGN-NOTE:* standardize to 2–3 radii in a follow-up (touches many files; deferred to stay surgical).
6. **Type: system serif only** — elegant but not a bundled characterful display face. → *DESIGN-NOTE:* bundling a display serif (e.g. Fraunces) is a deliberate follow-up; system `ui-serif` keeps us offline now.
7. **Dark mode** — exists but not tuned to "lamplight on a leather desk". → *DESIGN-NOTE:* dedicated dark pass deferred (don't half-build).
8. **Gold accent** — legacy gold (#C9A227) still in a few spots (BMI/legacy); brand is green. Minor, low-risk to leave.

## What this pass changed (safe, global)
- Two-layer warm elevation shadows (`card/chip/nav/fab/sheet`).
- Archival paper grain (`body::before`, multiply, ~6% — screen/5% in dark).
- Native feel: no tap flash, no UI text-selection, `:focus-visible` ring.
- Global reduced-motion compliance.

## Deferred (need their own pass)
- Radius standardization across all screens.
- Bundled display serif.
- Dark-mode "warm lamplight" tuning.
