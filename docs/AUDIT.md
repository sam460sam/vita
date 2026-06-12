# WalkBid — Phase 0 Audit

_Generated: 2026-06-12 · branch `claude/walkbid-phase-0-audit-3c83rm`_

> **Read this first.** The master prompt assumes the repo is **“Cantieri”**, an
> existing field-operations app for construction. **It is not.** The repository
> at `/home/user/vita` is **“Vita / Vyta — Life OS”**, a personal
> life-tracking PWA (habits, water, fasting, journal, workouts, weight,
> personal finances, personal to-do projects). It shares WalkBid’s *technical
> stack* almost exactly, but has **no domain, data-model, or design-system
> overlap** with the WalkBid spec. This audit maps the reality on disk against
> the WalkBid target so we can agree a plan before any feature code is written.

---

## 1. What the repo actually is

**Vita — Life OS** (`package.json` name: `vita`, display name: `Vyta`).

- Purpose: all-in-one personal life dashboard. Modules: Today/Home widgets,
  Activity & workouts, Body weight & BMI, Habits, Personal projects/tasks
  (Kanban), Journal/mood, Goals, Personal finances, Calendar, Water, Fasting,
  Gamification/rewards, Recap, an assistant mascot (“Stella”), Pro/premium.
- Audience: an individual tracking their own life. **Light-first**, white,
  “serious/professional” design. Green leaf “V” logo.
- Languages: **Italian (primary) + English**. Codebase feature folders are
  Italian (`abitudini`, `attivita`, `progetti`, `finanze`, `diario`,
  `obiettivi`, `impostazioni`, …).
- Maturity: substantial, ~120 source files, ships to App Store as “Vyta”.
  `npx tsc --noEmit` is **clean** on the current tree (verified baseline).

## 2. Stack — matches WalkBid almost perfectly ✅

| Spec requirement (WalkBid §3) | Repo today | Verdict |
|---|---|---|
| React 18 | `react@^18.3.1` | ✅ |
| TypeScript **strict** | `tsconfig` strict, no `any` in code | ✅ |
| Vite | `vite@^5.4.5` | ✅ |
| Tailwind | `tailwindcss@^3.4.11`, token-as-CSS-var system | ✅ (tokens differ, see §5) |
| Dexie.js | `dexie@^4`, `dexie-react-hooks` (liveQuery) | ✅ |
| Capacitor (iOS-first) | Capacitor 8, iOS + Android projects present | ✅ |
| State manager | **none** — Dexie liveQuery + React Context | ⚠️ spec says “introduce Zustand if none exists” |
| Offline-first | Yes — local-only, PWA service worker, no network calls | ✅ strong foundation |
| i18n engine | Typed dict + `t()` + `useI18n()` (`src/i18n`) | ✅ reusable, languages must change |
| Backup export/import | JSON export/import in Settings (`backup/`) | ✅ pattern reusable; spec wants `.zip`+blobs |
| Native plugins present | app, filesystem, haptics, share, splash, status-bar, local-notifications, preferences | ✅ partial |

**Architecture quality is high and directly reusable:** UI never touches Dexie
directly — all data access goes through `src/data/repo.ts` (repositories) and
business logic lives in feature `logic.ts` files, exactly the discipline the
WalkBid spec demands (“business logic lives in `/src/services` and stores,
never inside components”). The `repo.ts` + typed `types.ts` + versioned Dexie
schema pattern is the single most valuable thing to keep.

## 3. Domain / data model — essentially zero overlap ❌

WalkBid §5 entities vs. what exists in `src/data/types.ts`:

| WalkBid entity | Exists today? | Notes |
|---|---|---|
| `clients` | ❌ | No CRM concept at all. |
| `projects` (jobsite: client, siteAddress, geo, lead→disputed) | ⚠️ name collision only | `Project` = a personal to-do project (name, color, archived). **Different shape, different meaning.** |
| `priceBook` | ❌ | None. |
| `estimates` / `estimateItems` | ❌ | None. |
| `contracts` (+ signature, sha256, audit) | ❌ | None. No signature capture, no hashing. |
| `changeOrders` / `coItems` | ❌ | None. |
| `photos` (geotagged, refType) | ❌ | Only an ad-hoc weight progress photo as a data-URL string. |
| `diaryEntries` (jobsite log + audio) | ⚠️ name only | `JournalEntry` = personal mood journal. Different. |
| `payments` (milestones, dueRule, late) | ❌ | None. Personal `Transaction` is income/expense, unrelated. |
| `blobs` (Blob store for photo/sig/pdf/audio) | ❌ | None — binaries are base64/data-URL strings today (the exact anti-pattern §3 forbids). |
| `settings` (company, license, payment instructions, aiMode) | ⚠️ different | `Settings` exists but holds personal goals/water/body/modules — none of the company fields. |

**Conclusion:** the WalkBid data model must be built new. Nothing in the
current schema can be adapted; at most we reuse the *patterns* (repo layer,
versioned migrations, `uid()`/`now()` helpers, backup roundtrip).

## 4. Feature modules — no reuse, but strong reference patterns

None of WalkBid’s M1–M8 modules exist. However several existing pieces are
high-quality references to copy structure from (not content):

- **PDF generation:** ❌ none. No `pdf-lib`. WalkBid M2/M3/M5 need it.
- **Signature capture / canvas:** ❌ none.
- **SHA-256 / WebCrypto:** ❌ none.
- **Camera:** ❌ `@capacitor/camera` not installed.
- **Geolocation:** ❌ `@capacitor/geolocation` not installed.
- **Speech recognition (P2):** ❌ not installed.
- **Share sheet:** ✅ `@capacitor/share` installed and used.
- **Haptics:** ✅ installed (`src/platform`), ready for the signed/paid feedback the spec wants.
- **EmptyState / Card / Sheet / Field / Segmented / Button** UI primitives: ✅
  exist in `src/ui` — good base, but styled for the light theme; need
  re-skinning, and WalkBid-specific components (`MilestoneBar`, `SignaturePad`,
  `PhotoStrip`, `MoneyText`, `StatBadge`, `VoiceButton`) are all new.

## 5. Design system — opposite direction ❌

| | Vita today | WalkBid “Premium Jobsite” |
|---|---|---|
| Mode | **Light-first**, white surfaces | **Dark-first**, asphalt `#0E1013` |
| Accent | Green leaf | Safety orange `#FF6A00` |
| Tokens | `app/section/card/ink/ink-2/line` + module accents, as CSS vars | `asphalt/graphite/steel/chalk/dust/safety/signal/go/risk` |
| Type | System sans only (Google Fonts removed for privacy) | Archivo (display) + Inter (body), tabular nums |
| Radius | 16px card / 12px btn | 10px, square/solid, no gradients |
| Signature UI | n/a | `MilestoneBar` job-progress bar |

The token mechanism (Tailwind colors → CSS variables in
`src/styles/index.css`, `darkMode: 'class'`) is reusable; the **values and the
default mode must flip**. Note the privacy work that *removed* external Google
Fonts — re-adding Archivo/Inter must respect that (self-host, or accept system
fallback) and is itself a decision.

## 6. i18n — engine reusable, languages must change

- Engine: `src/i18n` — typed `TKey` union, `it.ts` + `en.ts` dictionaries,
  `t()` with `{var}` interpolation, `useI18n`/`useT`, date-fns locale wiring.
  **Architecturally exactly what WalkBid §7 wants.**
- Gap: current pair is **it + en, default it/system**. WalkBid wants **en
  default + es secondary** (crew/voice flows). So: add `es`, make `en` the
  default, retire/replace `it`, and rewrite every dictionary value for the
  contractor domain. `src/lib/format.ts` is hardwired to `it`/`en` and defaults
  `activeLang = 'it'`, currency `EUR`, `it-IT` locale → must become `en-US`/USD
  and imperial unit formatting.

## 7. Branding surface (rebrand audit) — every “Vyta/Vita” reference

The prompt asked for hardcoded “Cantieri”; in this repo the brand string is
**“Vyta”** (display) / **“Vita”** (internal). Inventory:

- **UI components:** `src/app/Sidebar.tsx:16`, `src/features/recap/RecapPage.tsx:94`,
  `src/features/recap/shareImage.ts:41` — hardcoded “Vyta” (should read `BRAND`).
- **i18n strings:** ~26 values in `src/i18n/en.ts` and `src/i18n/it.ts` embed
  “Vyta” (e.g. `more.tagline`, `settings.version`, `onboard.1.title`,
  `pro.title`, reminder bodies, `stella.subtitle`). All must be rewritten for
  WalkBid (and most of these features won’t exist in WalkBid anyway).
- **HTML:** `index.html` — `<title>Vyta — Life OS</title>` and
  `apple-mobile-web-app-title = "Vyta"`. Theme bootstrap key `vita.theme`.
- **Capacitor:** `capacitor.config.ts` — `appId: 'app.vita.lifeos'`,
  `appName: 'Vyta'`, white `backgroundColor` (must go dark).
- **iOS native:** `ios/App/App/Info.plist` `CFBundleDisplayName = Vyta`,
  `CFBundleDevelopmentRegion = it`; `project.pbxproj`
  `PRODUCT_BUNDLE_IDENTIFIER = app.vita.lifeos` (×2).
- **PDF headers:** none yet (no PDF feature) — will be net-new and must read `BRAND`.
- **Splash/icons:** green leaf “V” assets in `icons/`, `assets/`, `public/`,
  `store/screenshots*` — all Vita-branded, need replacement.
- **Docs/store:** `README.md` (Italian, “Vita — Life OS”), `store/LISTING.md`,
  `store/PRIVACY.md`, `store/PUBLISH.md`, `MOBILE.md`, `NATIVE.md`, `GROWTH.md`.
- **DB / storage keys:** Dexie database named `vita`; localStorage keys
  `vita.lang`, `vita.theme`. Renaming the DB is a migration risk (see plan).

**Bundle id:** currently `app.vita.lifeos`. Per §0, if WalkBid is **not yet**
registered in App Store Connect we adopt **`com.walkbid.app`**; if the legacy
record is live we keep the id and change only the display name. **This needs
your confirmation** — captured as an open question.

## 8. Dependencies to add for WalkBid

Not present today, required by spec:

- `pdf-lib` (M2/M3/M5 PDFs, Letter size)
- `jszip` (backup .zip with blobs, §3)
- `@capacitor/camera` (M6/M8 photos)
- `@capacitor/geolocation` (signature + photo geotag)
- `@capacitor-community/speech-recognition` (P2 voice)
- `zustand` (spec: introduce if no state manager — none exists)
- Fonts: Archivo + Inter (self-hosted, to preserve the privacy posture)

Already present and reusable: `@capacitor/share`, `@capacitor/haptics`,
`@capacitor/filesystem`, `dexie`, `date-fns`, `lucide-react`.

## 9. The central decision (blocks Phase 1)

Because Vita and WalkBid overlap only at the stack level, this is **not a
migration — it is a re-purpose / near-greenfield rebuild on shared scaffolding.**
The strategic choice is yours and is detailed in `docs/MIGRATION_PLAN.md §1`:

- **Option A (recommended): Repurpose this repo into WalkBid.** Strip the Vita
  feature modules, keep the infrastructure (build config, Capacitor shell, repo
  layer pattern, i18n engine, UI primitive scaffolding, backup pattern), and
  build M1–M6 fresh. One app, one brand.
- **Option B: Coexist** — keep Vita modules and add WalkBid alongside. Not
  recommended: conflicts with single-brand, single-storefront, dark-first spec
  and bloats the bundle.
- **Option C: Wrong repo / new repo** — if “Cantieri” was meant to be a
  *different* existing repository, point me at it; or if WalkBid should be a
  clean repo, say so.

No feature code has been written. Awaiting your decision before Phase 1.
