# Vita — Da PWA ad app native iOS & Android (Capacitor)

Vita è già **un solo codebase web React** pensato per essere impacchettato
come app nativa con **Capacitor**, senza riscrivere nulla. Questo file elenca
i passi futuri. **Capacitor NON è ancora installato** — qui c'è solo la mappa.

## Perché è già pronta

L'app rispetta da subito le regole che tengono aperta la strada al nativo:

- **Storage astratto** — tutto l'accesso ai dati passa da `src/data/repo.ts`
  (sopra Dexie/IndexedDB in `src/data/db.ts`). La UI non tocca mai il DB
  direttamente: domani si può sostituire con SQLite nativo riscrivendo solo
  questi due file.
- **API di piattaforma astratte** — file, condivisione, notifiche e feedback
  tattile passano da `src/platform/platform.ts`. Nessun componente chiama
  `navigator`/`window` direttamente: basterà sostituire le implementazioni con
  i plugin `@capacitor/*`.
- **Safe-area insets** — header e tab bar usano `env(safe-area-inset-*)`
  (token `safe-top`/`safe-bottom` in Tailwind), così notch e barre di sistema
  sono rispettate.
- **Routing da asset statici** — si usa `HashRouter` e `base: './'` in
  `vite.config.ts`: l'app gira da file locali, senza dipendere da un server.
- **Tocco & gesti** — hit target ≥ 44px, niente interazioni hover-only.
- **Dati salute pronti** — i `workouts` hanno già il campo
  `source: 'manual' | 'healthkit' | 'healthconnect'`, pronto per importare
  dati reali via plugin in futuro.

## Passi per aggiungere Capacitor

> Richiede **Xcode** (iOS) e **Android Studio** (Android) sulla macchina di build.

```bash
# 1. Installa il core e la CLI
npm i @capacitor/core
npm i -D @capacitor/cli

# 2. Inizializza (appId in reverse-DNS, appName, webDir = cartella di build)
npx cap init Vita com.tuonome.vita --web-dir=dist

# 3. Aggiungi le piattaforme
npm i @capacitor/ios @capacitor/android
npx cap add ios
npx cap add android

# 4. Build web + sync nei progetti nativi (ripeti dopo ogni modifica web)
npm run build
npx cap sync

# 5. Apri negli IDE nativi per compilare/firmare/pubblicare
npx cap open ios
npx cap open android
```

In `capacitor.config.ts` assicurati che `webDir` sia `dist`.

## Plugin consigliati

| Esigenza | Plugin | Dove si aggancia |
|---|---|---|
| Preferenze leggere | `@capacitor/preferences` | sostituisce eventuali usi di localStorage |
| File / backup | `@capacitor/filesystem` + `@capacitor/share` | `platform.saveTextFile` / `platform.pickTextFile` / `platform.share` |
| Notifiche promemoria | `@capacitor/local-notifications` | promemoria abitudini (oggi solo flag UI) |
| Feedback tattile | `@capacitor/haptics` | `platform.haptic` |
| Status bar / splash | `@capacitor/status-bar`, `@capacitor/splash-screen` | tema chiaro coerente |
| **Dati salute iOS** | plugin HealthKit (es. community `@perfood/capacitor-healthkit`) | scrive `workouts` con `source: 'healthkit'` |
| **Dati salute Android** | plugin Health Connect | scrive `workouts` con `source: 'healthconnect'` |

## Migrazione storage a SQLite (opzionale, futura)

Quando i volumi crescono, si può passare a `@capacitor-community/sqlite`:
reimplementa **solo** `src/data/db.ts` e `src/data/repo.ts` mantenendo le
stesse firme. La UI e la logica dei moduli non cambiano.
