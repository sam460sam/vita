# Geode — Crystal & Rock Identifier

> **Geode: Crystal & Rock ID** — _Identify crystals, rocks & gems._
> A production-ready, App-Store-publishable iOS app. Point your camera at a
> crystal, rock, mineral or gem → get an honest, AI-powered identification with
> confidence scores → collect your finds offline.

This project is **fully self-contained** in this `geode/` folder and shares
nothing with any other app in the repository.

---

## Stack

- **Capacitor 6** (iOS wrapper) + **React 18 + TypeScript + Vite + Tailwind CSS**
- **Dexie.js** (IndexedDB) — offline-first, no account, no login
- **@revenuecat/purchases-capacitor** — subscriptions (receipts, restore, entitlements)
- Capacitor plugins: camera, preferences, share, haptics, splash-screen,
  status-bar, local-notifications, filesystem, app
- **One backend only:** a **Cloudflare Worker** proxy (`/worker`). The AI key
  **never** ships in the client.
- Dark-first "Liquid Glass" design — anthracite + amethyst/quartz accents.

## Project layout

```
geode/
  src/
    app/         App shell, nav, TabBar, splash gate
    state/       AppState context (consent / Pro / free-scan counter)
    features/    onboarding · consent · scan · result · collection · home · paywall · settings
    ui/          Design system (Button, Card, Sheet, Pill, ConfidenceBar, Toast…)
    data/        Dexie db, repositories, types, offline reference content
    platform/    platform.ts, camera, native, notifications, purchases, consent
    lib/         config, api (proxy client), image compression, hash, format
    styles/      dark-first tokens + Liquid Glass helpers
  worker/        Cloudflare Worker proxy (Google Gemini) + deploy docs
  ios-native/    Widget + App Intent (Swift) + PrivacyInfo.xcprivacy + setup
  assets/        source SVGs + generated icon/splash PNGs
  scripts/       gen-assets.mjs
  APP_STORE_SUBMISSION.md   Privacy Policy, EULA, listing, reviewer notes, checklists
```

## Quick start (web preview)

```bash
cd geode
npm install
npm run dev        # http://localhost:5173 — full flow works in the browser
```

On the web, the camera uses a file picker and RevenueCat degrades gracefully
(use the dev Pro override below) so every screen is testable without a device.

## Build the iOS app

```bash
cd geode
npm install
npm run build          # type-check + production bundle into dist/
npx cap add ios        # one-time: generates ios/App
npx cap sync ios       # copies dist/ + plugins into the native project
npm run assets         # regenerate icon/splash source PNGs (optional)
npx @capacitor/assets generate --ios   # generate the iOS icon set + splash
npx cap open ios       # open ios/App/App.xcworkspace in Xcode 26
```

Then in Xcode 26 (targeting **iOS 26 SDK**, deployment target **iOS 16+**):
1. Set your **Team** + **Bundle Identifier** (e.g. `com.yourdev.geode`).
2. Add the camera/photo usage strings and the `geode` URL scheme
   (see `ios-native/README.md`).
3. Add the **Privacy Manifest**, **App Intent** and **Widget**
   (see `ios-native/README.md`).
4. **Product ▸ Archive** → **Distribute App** → App Store Connect.

---

## 🔑 Where to paste YOUR keys

Everything you need to fill in lives in **`src/lib/config.ts`** (or as `VITE_*`
env vars at build time):

| Setting | Where | What |
|--------|-------|------|
| `proxyUrl` | `src/lib/config.ts` / `VITE_PROXY_URL` | Your deployed Cloudflare Worker URL |
| `revenueCatIosKey` | `src/lib/config.ts` / `VITE_REVENUECAT_IOS_KEY` | RevenueCat **public** iOS key (`appl_…`) |
| `termsUrl` | `src/lib/config.ts` / `VITE_TERMS_URL` | Hosted Terms of Use (EULA) URL |
| `privacyUrl` | `src/lib/config.ts` / `VITE_PRIVACY_URL` | Hosted Privacy Policy URL |
| `supportEmail` | `src/lib/config.ts` | Your support email |
| `AI_API_KEY` | **Cloudflare Worker secret** (never in the app) | Google Gemini API key |
| Bundle ID | `capacitor.config.ts` `appId` + Xcode | e.g. `com.yourdev.geode` |

Legal text to host is provided ready-to-go in **`APP_STORE_SUBMISSION.md`**.

## Deploy the Worker (the AI proxy)

```bash
cd worker
wrangler secret put AI_API_KEY     # paste your Google Gemini key
wrangler kv namespace create RATE_LIMIT   # optional: per-IP rate limiting
wrangler deploy
```

Full instructions: [`worker/README.md`](./worker/README.md). Then paste the
printed Worker URL into `proxyUrl`.

## Configure the 3 products (RevenueCat + App Store Connect)

Create an entitlement called **`pro`** in RevenueCat, attached to these
products (create the matching auto-renewable subscriptions / non-consumable in
**App Store Connect** first):

| Product ID | Type | Price | Notes |
|-----------|------|-------|-------|
| `geode_weekly` | Auto-renewable (1 week) | **$4.99/week** | 3-day free trial (intro offer) |
| `geode_annual` | Auto-renewable (1 year) | **$29.99/year** | Default, "Best value · ~88% off" |
| `geode_lifetime` | Non-consumable | **$49.99** | One-time, optional |

1. In **App Store Connect**: create the subscription group + 3 products with
   the IDs above; add a **3-day free trial** introductory offer to
   `geode_weekly`. Add your **EULA** and **Privacy Policy** URLs.
2. In **RevenueCat**: add the 3 products, create entitlement `pro`, attach all
   three, and put them in the **current Offering** (packages
   `$rc_weekly`, `$rc_annual`, `$rc_lifetime` or custom — the app reads by
   product id).
3. Paste your RevenueCat **public iOS key** into `revenueCatIosKey`.

The product IDs are centralised in `src/lib/config.ts` (`products`).

## Monetization model

- **Free tier (honest):** 2 total free scans, then the paywall. The collection,
  Stone of the Day and reference content stay usable.
- **Pro** (`pro` entitlement): unlimited scans + unlimited "refine the result" +
  full traditional-meanings & value estimates + collection export.
- Paywall is **App Store 2026 compliant** — see the §3.1.2 checklist in
  `APP_STORE_SUBMISSION.md`.

## Dev tips

- **Preview Pro on web:** in the browser console run
  `localStorage.setItem('geode.devPro','true')` then reload.
- **Reset onboarding/consent on web:** clear localStorage / IndexedDB.
- **Cost:** photos are compressed client-side to ≤768px JPEG (q0.7) before
  upload, so each scan is well under \$0.001 with Gemini Flash. Identical images
  are served from the local cache (no second API call).

---

## ✅ TODO — things only YOU can provide

1. **Deploy the Worker** and set `AI_API_KEY` (Gemini). Paste the URL into
   `proxyUrl`.
2. **RevenueCat**: paste your public iOS key into `revenueCatIosKey`; create the
   3 products + `pro` entitlement in RevenueCat **and** App Store Connect.
3. **Host the legal text** (Privacy Policy + EULA from
   `APP_STORE_SUBMISSION.md`) and set `termsUrl` / `privacyUrl`.
4. **Bundle ID + Team** in `capacitor.config.ts` and Xcode signing.
5. In Xcode: add camera/photo **usage strings**, the **`geode` URL scheme**, the
   **PrivacyInfo.xcprivacy**, the **App Intent** and the **Widget**
   (`ios-native/README.md`).
6. Add your **support email** in `config.ts`.
7. Generate final icons: `npm run assets && npx @capacitor/assets generate --ios`.
