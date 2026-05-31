# Vita — Build delle app native (iOS & Android)

Capacitor è **già configurato**. I progetti nativi vivono in `ios/` e `android/`.
Questo file spiega come compilarli e pubblicarli. (Per il contesto/architettura
vedi `MOBILE.md`.)

## Cosa è già pronto in repo
- `capacitor.config.ts` — appId `app.vita.lifeos`, appName `Vita`, `webDir: dist`
- Progetti **iOS** (`ios/`) e **Android** (`android/`) con 8 plugin nativi:
  app, filesystem, share, haptics, local-notifications, preferences,
  status-bar, splash-screen
- Icone e splash native generate (`assets/` → sorgenti, output negli xcassets/res)
- `src/platform/*` usa automaticamente le API native quando gira come app
- Permessi notifiche Android (`POST_NOTIFICATIONS`, `*_EXACT_ALARM`)

## Flusso di lavoro (dopo ogni modifica al codice web)
```bash
npm run build      # compila la web app in dist/
npx cap sync       # copia dist/ nei progetti nativi e aggiorna i plugin
```

## Android (serve Android Studio)
```bash
npx cap open android      # apre il progetto in Android Studio
```
Poi in Android Studio:
1. Attendi il sync di Gradle.
2. **Run** su un emulatore/dispositivo per provarla.
3. Per pubblicare: **Build → Generate Signed Bundle/APK → Android App Bundle (.aab)**,
   crea/usa un keystore, poi carica l'`.aab` su **Google Play Console**
   (account: 25 $ una tantum).

## iOS (serve un Mac con Xcode)
```bash
sudo gem install cocoapods   # se non presente
npx cap open ios             # apre il workspace in Xcode
```
Poi in Xcode:
1. Seleziona il target **App** → tab **Signing & Capabilities** → scegli il tuo
   **Team** Apple Developer (99 $/anno). Il bundle id è `app.vita.lifeos`.
2. **Run** su simulatore/dispositivo per provarla.
3. Per pubblicare: **Product → Archive → Distribute App → App Store Connect**,
   poi gestisci la scheda su **App Store Connect** e invia per la review.

## Note
- Cambiare versione: `CFBundleShortVersionString`/`CFBundleVersion` (iOS) e
  `versionName`/`versionCode` in `android/app/build.gradle`.
- Le notifiche locali (promemoria abitudini) chiedono il permesso al primo uso.
- L'app gira 100% offline da asset locali (HashRouter + base relativa), nessun
  server richiesto.
