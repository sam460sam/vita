# WalkBid

**Every change order signed. Every job paid.**

WalkBid is the field-operations app for small **US hardscape, concrete and
paving contractors**. Walk the site, bid before you leave the driveway, and get
every change order signed where the work happens — estimate → contract → change
orders → proof package → payment milestones. Offline-first, phone-first.

> This is a **standalone app** living in the `walkbid/` subfolder. It is
> independent from the unrelated `Vita` app in the repository root (separate
> package, build, database and assets — nothing shared).

## Status

- **Phase 0** — audit + plan: `../docs/AUDIT.md`, `../docs/MIGRATION_PLAN.md`.
- **Phase 1 (M1–M6)** — complete: Clients & Projects, Price book & Estimate,
  Contract + Signature, Payments/Protection, Proof Package, Daily log. See
  `docs/QA_P1.md`.
- **Phase 2 (M7–M8)** — AI estimate/change-order/log + voice. Not started.
- **Phase 3** — parked (seams only: `src/config/features.ts`,
  `src/services/phase3/`).

## Stack

- React 18 + TypeScript (strict) + Vite + Tailwind (dark “Premium Jobsite”)
- Dexie.js (IndexedDB) behind a repository/service layer — UI never touches the
  DB directly; business logic lives in `src/services`
- Capacitor (iOS-first): Camera, Geolocation, Haptics, Share, Filesystem
- pdf-lib (Letter PDFs), JSZip (backup), WebCrypto (SHA-256 audit)

## Commands

```bash
cd walkbid
npm install
npm run dev        # local dev
npm run build      # tsc -b + vite build
npm run typecheck  # tsc --noEmit
```

## Native (iOS)

```bash
npm run build
npx cap add ios    # first time
npx cap sync
npx cap open ios
```

Bundle id `com.walkbid.app`, display name **WalkBid** (`capacitor.config.ts`).

## Market & privacy

- **United States storefront only** — configured in App Store Connect, no code
  change required.
- **Imperial units** (SF/SY/CY/LF/EA/HR/TON/LS), **USD** via
  `Intl.NumberFormat('en-US')`, US date format.
- **Local data only** — everything stays on device; the only outbound action is
  the user sharing a file/message. App Store posture: **Data Not Collected**.
- Languages: English (default) + Spanish (crew-facing log/voice flows).

## Legal

Electronic signatures follow the U.S. ESIGN Act and UETA (timestamp, SHA-256
fingerprint, optional geolocation). The bundled contract terms are a neutral
starting template — home-improvement contract requirements vary by state; have
it reviewed by a construction attorney. WalkBid does not provide legal advice.
