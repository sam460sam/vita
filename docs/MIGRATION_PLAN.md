# WalkBid — Migration Plan

_Companion to `docs/AUDIT.md`. Branch `claude/walkbid-phase-0-audit-3c83rm`._

> **Status: Phase 0 — open questions resolved (see “Decisions”). No feature
> code written yet; awaiting go-ahead to start Phase 1.**

## Decisions (resolved 2026-06-12)

The audit established that this repo is **Vita — Life OS**, a *different,
existing* project that merely shares WalkBid’s stack. Per your direction:

1. **Host:** WalkBid is a **brand-new, standalone app built from zero** in a new
   **`walkbid/` subfolder** of this repo. The existing Vita app
   (everything outside `walkbid/`) is **never touched, modified, or deleted**.
   The two apps are independent — separate `package.json`, build, Dexie DB,
   Capacitor project, and assets.
2. **Not a repurpose/migration.** Option A (gut Vita) and Option B (coexist in
   one app) from the earlier draft are **rejected**. There is no data or feature
   migration from Vita — WalkBid starts empty.
3. **Bundle id:** WalkBid is not yet in App Store Connect → adopt
   **`com.walkbid.app`**, display name **WalkBid**.
4. **Old data:** Vita’s `vita` IndexedDB is left alone; WalkBid uses its own new
   `walkbid` database. Nothing exported, nothing deleted.
5. **Stack:** WalkBid reuses the same proven tooling choices (React 18 + TS
   strict + Vite + Tailwind + Dexie + Capacitor) but as a **fresh scaffold**,
   not by importing Vita’s code. Patterns are referenced; files are not shared.

Everything below that describes editing/removing Vita files is **superseded** by
the decisions above and kept only as audit context.

## Product inspiration — Handoff Construction Estimator (1Build)

The idea originates from **Handoff** (1Build, Inc.) — the exact app the WalkBid
spec positions against. Reference screens reviewed; flows worth borrowing
(layout/interaction only, not branding):

- **AI-drafted estimate** with line items (`qty · $ · unit`), markup shown to the
  contractor, one-tap **“Convert to”** contract. → M2 + M8 Flow A.
- **Change order records** ledger: delta-colored rows (+green / −red),
  Approved/Sent status, **Initial total vs Updated total**. → M3 + M8 Flow B
  (WalkBid adds on-site signature + SHA-256/geo audit).
- **Branded proposal PDF** with company logo, license #, client block, signature
  — “send before you leave the driveway” (our tagline). → M2/M3.
- **Get-paid** screen (deposit, ACH/card). WalkBid **deliberately differs**:
  payment *protection* (Zelle/check/ACH + user-pasted link), not a processor,
  to keep the App Store “Data Not Collected” posture.
- **Walkthrough capture** — photos while thinking out loud. → M6 + M8 Flow C.
- Handoff’s **Schedule/“builds itself”** is **out of WalkBid scope** (skip).

**Differentiation preserved:** Handoff is an AI estimator that stops at the
deposit; WalkBid owns post-contract jobsite execution (signed change orders +
proof package). We borrow polish and proven layouts, not the positioning.

**Open design point:** Handoff uses a forest-green aesthetic; the WalkBid spec
specifies dark **asphalt + safety-orange** “Premium Jobsite”. Palette to be
confirmed before building design tokens (see Phase-1 go-ahead).

## 0. Premise & the one conflict that matters

The spec (WALKBID master prompt) describes migrating an existing **Cantieri**
construction app. The repo on disk is **Vita/Vyta — Life OS**, an unrelated
personal-tracking app on the *same stack*. Per operating rule §8 (“if this spec
conflicts with existing code, this spec wins — but flag the conflict here”):

- **Flagged conflict:** there is no Cantieri code to migrate. Every WalkBid
  feature, entity and screen is net-new. Existing Vita features (habits, water,
  fasting, journal, personal finances, gamification, Stella, etc.) are **out of
  scope** for WalkBid and, under Option A, will be removed.
- **What survives:** the *infrastructure and conventions*, not the features —
  see §2.

## 1. Strategic decision (must be resolved first)

| | Option A — Repurpose (recommended) | Option B — Coexist | Option C — Different/clean repo |
|---|---|---|---|
| What happens to Vita features | Removed | Kept alongside WalkBid | N/A |
| Brand / storefront | Clean WalkBid, US-only | Mixed identity (conflicts §0/§3) | Clean |
| Bundle size & cold-start (<2s) | Best | Worst (dead modules) | Best |
| Effort | Medium (reuse scaffolding) | High (two apps, shared shell) | Highest (rebuild infra too) |
| Risk | Low | High | Medium |

**Recommendation: Option A.** Keep the proven scaffolding, delete the personal
modules, build M1–M6 fresh. Rationale: WalkBid is single-trade, single-brand,
single-storefront, dark-first — Vita’s modules actively fight all four. The
valuable asset is the *engineering*, which is already in the right shape.

The rest of this plan assumes **Option A** unless you choose otherwise.

## 2. Keep / Adapt / Remove / Build-new

### KEEP (infrastructure & conventions — touch lightly)
- Vite + TS-strict config, path alias `@/ → src/`, PWA plugin, `npm run build`.
- Capacitor shell (`capacitor.config.ts`, `ios/`, `android/`) — re-skin only.
- Repo-layer discipline: `src/data/db.ts` (Dexie + `uid`/`now`), `src/data/repo.ts`,
  typed `src/data/types.ts`. Reuse the *pattern*; replace the *content*.
- i18n engine `src/i18n/*` (typed `t()`), `HashRouter` routing in `App.tsx`.
- Native bootstrap (`src/platform/native.ts`), Haptics, Share, Filesystem.
- Backup roundtrip pattern (`src/features/backup`) — upgrade to `.zip`+blobs.
- UI primitives worth re-skinning: `Card`, `Sheet`, `Field`, `Segmented`,
  `Button`, `EmptyState`, `Toast`, `Pill`.

### ADAPT
- **Design tokens** (`tailwind.config.js` + `src/styles/index.css`): replace the
  Vita palette with WalkBid `asphalt/graphite/steel/chalk/dust/safety/signal/
  go/risk`; flip default to **dark**. Keep the CSS-var mechanism.
- **`src/lib/format.ts`**: switch to `en-US`/**USD**, imperial units
  (sf/sy/cy/lf/ea/hr/ton/ls), US date format; drop the `it` default.
- **i18n languages**: `en` default (rewrite for contractor domain) + add `es`
  for crew/voice flows; retire `it`.
- **Navigation** (`nav.ts`, `TabBar`, `Sidebar`): rebuild tabs to
  `Jobs · Clients · + (FAB) · Price book · Settings` (§8).

### REMOVE (Option A — Vita feature folders)
`abitudini, acqua, altro, attivita, calendario, diario, digiuno, finanze,
gamification, home/widgets, obiettivi, oggi, peso, pro, recap, stella,
personalizzazione` plus their routes, nav entries, i18n keys, seeds, and the
weight/water/workout/habit/journal/goal/transaction tables. Done as one
“remove Vita modules” commit so history stays clean and reversible.

### BUILD-NEW (WalkBid M1–M6, Phase 1)
All entities in §5 of the spec; all screens in §6 P1; shared components
`MilestoneBar`, `SignaturePad`, `PhotoStrip`, `VoiceButton` (P2 seam),
`MoneyText`, `StatBadge`; PDF pipeline (pdf-lib) + SHA-256 (WebCrypto) + blobs
table; seed price book (§9).

## 3. Data model migration

Approach: **new database, clean schema** rather than versioning Vita’s `vita`
DB into a contractor schema (the tables are unrelated; a “migration” would just
be deletion + creation). Recommended:

- New Dexie DB name `walkbid` with `version(1)` defining the §5 tables
  (`clients, projects, priceBook, estimates, estimateItems, contracts,
  changeOrders, coItems, photos, diaryEntries, payments, blobs, settings`).
- Keep `uid()`/`now()`. All binaries → `blobs` table as `Blob` (never base64).
- Because there is no real Vita user data to preserve in a WalkBid context, no
  data migration is required. **Decision needed:** confirm we can drop the old
  `vita` IndexedDB on first WalkBid launch (any existing testers’ Vita data
  would be discarded). Captured as an open question.

## 4. Rebrand surface — concrete change list (from AUDIT §7)

1. `src/config/brand.ts` — **created** (`BRAND = "WalkBid"`). All UI/PDF/splash
   strings must import from here.
2. Replace hardcoded “Vyta” in `Sidebar.tsx`, `RecapPage.tsx`, `shareImage.ts`
   (these files are slated for removal under Option A, but any survivor reads `BRAND`).
3. Rewrite all brand-bearing i18n values (≈26 keys) — superseded by the new
   contractor dictionaries.
4. `index.html`: title → “WalkBid”, apple title → “WalkBid”; theme bootstrap
   key `vita.theme` → `walkbid.theme`.
5. `capacitor.config.ts`: `appName → "WalkBid"`; `appId` → `com.walkbid.app`
   **iff not yet registered** (else keep); `backgroundColor` → dark `#0E1013`.
6. `ios/App/App/Info.plist`: `CFBundleDisplayName → WalkBid`,
   `CFBundleDevelopmentRegion → en`; add camera/location/mic usage strings
   (in-context, §10). `project.pbxproj` bundle id per (5).
7. Icons/splash/screenshots: replace green-leaf assets with WalkBid
   safety-orange-on-asphalt set.
8. Docs: rewrite `README.md` (English, US-only storefront note), refresh/retire
   `store/*`, `MOBILE.md`, `NATIVE.md`, `GROWTH.md`.
9. Rename Dexie DB `vita → walkbid`, localStorage `vita.lang → walkbid.lang`.

## 5. Phase 3 seams (parked — build zero implementation)

Add a `FEATURES` flag object and empty service interfaces only, for:
crew/sub marketplace, materials ordering, Stripe/payment-provider integration,
client web portal. Routes guarded by flags, no UI, no logic.

## 6. Proposed phase sequence (after approval)

- **P0 (this):** audit + plan + `brand.ts`. ← you are here, **STOP for approval.**
- **P1a — Foundation:** Option-A teardown (remove Vita modules), new `walkbid`
  schema + repo layer, design tokens (dark + WalkBid palette), i18n reset
  (en/es), nav shell (Jobs/Clients/+/Price book/Settings), rebrand surface,
  shared UI primitives + `MoneyText`/`StatBadge`/`MilestoneBar`.
- **P1b — Wedge:** M1 Clients & Projects → M2 Price book & Estimate (+ PDF) →
  M3 Contract + Signature + SHA-256 audit → M4 Payments/Protection →
  M5 Proof Package → M6 Daily log. `tsc`/`build` clean + manual checklist per module.
- **P1 close:** `docs/QA_P1.md`, README, commit list.
- **P2:** M7 AI layer (Mock default) + M8 voice flows, `docs/AI_PROXY.md`,
  `docs/QA_P2.md`. (Only after P1 approved & tested.)
- **P3:** parked — seams only.

## 7. Open questions (need your answers before Phase 1)

1. **Strategy:** Option A (repurpose — remove Vita), B (coexist), or C
   (different/clean repo)? Recommended: **A**.
2. **Cantieri:** Was “Cantieri” meant to be a *different* repo I should be
   pointed at, or is it just a stale codename for this one? (Assuming the
   latter.)
3. **Bundle id:** Is WalkBid already registered in App Store Connect? If **no**
   → adopt `com.walkbid.app`. If **yes** → which id do we keep?
4. **Old data:** OK to drop the legacy `vita` IndexedDB on first launch
   (discards any existing Vita tester data)?
5. **Fonts:** Re-add Archivo + Inter self-hosted (the privacy work deliberately
   removed external Google Fonts), or stay on system fonts for v1?
6. **State manager:** Spec says introduce Zustand since none exists — OK to add
   it, or keep the Dexie-liveQuery + Context approach already in use?
