# WalkBid — QA Phase 1

_Build: standalone `walkbid/` app · branch `claude/walkbid-phase-0-audit-3c83rm`._

Legend: ✅ verified here · 🟡 needs on-device pass (iOS) · ⬜ not applicable yet

## Automated gates
- ✅ `npx tsc --noEmit` clean (TypeScript strict, no `any`).
- ✅ `npm run build` clean. Main chunk 104 kB (33 kB gz); pdf-lib/jszip
  code-split into the lazy project-detail chunk → cold start budget respected.
- ✅ Production preview serves HTTP 200, title “WalkBid”, bundle loads.

## §11 checklist

1. **Airplane-mode matrix (client → estimate → contract → sign → CO → proof).**
   🟡 on-device. Logic is fully offline: all reads/writes go through Dexie; the
   only network calls in the app are the native Share sheet and (P2) AI. No
   fetch/XHR on any P1 path.
2. **Signature integrity: shown hash == recomputed after export/import.**
   ✅ design verified — `signContract`/`signChangeOrder` hash the exact saved
   PDF bytes (WebCrypto SHA-256); `verifyContract` recomputes from the stored
   blob. Backup preserves blobs byte-for-byte (stored as Blobs in the zip), so
   the digest is stable across export/import. 🟡 full device roundtrip.
3. **PDF (Letter) renders in iOS Files / iMessage / Adobe.** 🟡 on-device.
   Generated with pdf-lib at 612×792, standard Helvetica, embedded PNG/JPG.
4. **Permission denial paths (camera, mic, location) never dead-end.** ✅ code
   verified — `currentGeo`, `capturePhoto` resolve to `undefined`/`null` on
   denial; callers toast and continue. Signing works without geo. (mic = P2.)
5. **Backup export → wipe → import roundtrip, zero loss incl. blobs.** ✅ logic
   verified — `exportBackup` writes every table + each blob file; `importBackup`
   clears and restores all tables and blob binaries. 🟡 device roundtrip.
6. **`tsc --noEmit` + `npm run build` clean, no console errors on happy paths.**
   ✅ build/typecheck; 🟡 runtime console on device.
7. **Touch targets ≥ 48px; AA contrast at full brightness.** ✅ structurally —
   buttons/inputs use `min-h-touch` (48px), FAB 56px; chalk #F2F3F5 on asphalt
   #0E1013 ≈ 16:1. 🟡 outdoor-brightness eyeball pass.
8. **SF/CY calculators vs hand math.** ✅ verified:
   - `cubicYards(20,20,6in)` = **7.41 cy** (expected 7.41).
   - `areaSF([12×10, 8×6])` = **168 SF**.
   - totals base $400 + 10% markup + 8% tax = **$475.20**.
9. **(P2 only)** ⬜ deferred to Phase 2.

## Manual device test script (run on iPhone)
1. Settings → fill company name + license + payment instructions.
2. Clients → add “Adam Appleseed”. Jobs → new job “Paver patio”, tag location.
3. Estimate → add EX01, GB01, PV01 (use SF calculator: 20×20), set 10% markup,
   8% tax → Share proposal PDF (check iMessage preview).
4. Convert to signed contract → sign in **airplane mode** → Contract tab shows
   “Integrity verified” + audit (who/when/where/SHA-256).
5. Payments → 30% deposit + balance → header shows “Deposit not collected” →
   Request payment (share) → Mark deposit paid → MilestoneBar segment turns green.
6. Change orders → photo + “extend patio” + line +$800 → Sign on site → an
   Extra payment row appears automatically.
7. Log → add note + photo. Proof → Generate proof PDF (verify photos + hashes).
8. Settings → Export backup (.zip) → Restore → confirm nothing lost.

## Known limitations entering P2
- Fonts: Archivo/Inter referenced with system fallback (no external fetch to
  preserve privacy posture); self-hosted faces not yet bundled.
- AI buttons hidden (`aiMode` default `mock`, UI lands in P2).
- iOS native project not yet generated for `walkbid/` (run `npx cap add ios`).
