# Vyta — Design Log

Decisions for the elevation pass, so a future pass can build on them.

## Identity note
The master prompt said "cream/gold". Vyta's shipped identity is **warm cream paper
+ botanical green** (the Vio companion). Constraint #1 = "do not change the brand",
so I elevated the *real* identity (paper + green), treating "gold foil / fine
stationery" as the **material** target (tooth, soft shadow, restraint), not a hue swap.

## Kept
- **Two-layer warm shadows.** Paper casts a tight contact shadow + a soft ambient one.
  Replaced single big blurs with `ambient + key` pairs. Biggest lever for "premium".
- **Archival paper grain** under the UI (`body::before`, bundled SVG `feTurbulence`,
  multiply ~6%). Sits *below* `#root` so it textures the cream margins without
  touching text crispness. Offline, non-interactive.
- **Native feel:** `-webkit-tap-highlight-color: transparent`, `user-select:none` on
  buttons/links/role=button, on-brand `:focus-visible` ring (keyboard only).
- **Reduced-motion:** global guard neutralizes animations/transitions when requested.
- Kept system `ui-serif` for display (offline, no CDN) — already elegant.

## Rejected / not done (with reason)
- **Per-screen radius standardization** — would touch ~15 files; too broad for a
  surgical reversible pass. Logged as a follow-up.
- **Bundling a custom display serif** — real asset + license decision; deferred.
- **Dark-mode re-tune** — half-building it would be worse than leaving it; deferred.
- **Stronger grain / texture flourishes** — risk of "noisy". Kept whisper-subtle
  (Chanel rule: remove what isn't earning its place).
- Did **not** touch Stella/Dexie/StoreKit/business logic, or add any network/analytics.

## Verification
- `tsc -b` clean · `vite build` clean · before/after screenshots captured.
- Native widget palette aligned in a prior commit; not part of this CSS pass.
