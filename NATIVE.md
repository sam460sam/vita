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

---

# Attivare le funzioni native (checklist)

Tutto il codice lato app è già pronto. Questi sono i passi finali da fare sul
**Mac in Xcode** / Android Studio dopo `npm run build && npx cap sync`.

## 🔔 Notifiche locali (promemoria abitudini + acqua/allenamento/diario)
Già implementate in `src/platform/notifications.ts` e collegate a Impostazioni
→ Promemoria e ai promemoria delle abitudini.

**iOS (Xcode):**
1. `npx cap open ios`
2. Target **App** → **Signing & Capabilities** → **+ Capability** →
   **Push Notifications** NON serve; per le locali basta che il plugin sia
   installato (lo è: `@capacitor/local-notifications`).
3. Al primo uso l'app chiede il permesso (gestito da `requestPermission()`).
4. Opzionale: aggiungi un suono custom in `ios/App/App` e referenzialo.

**Android (Android Studio):**
1. Permessi già nel manifest (`POST_NOTIFICATIONS`, `*_EXACT_ALARM`).
2. Su Android 13+ il permesso runtime viene chiesto automaticamente.
3. Verifica l'icona di notifica `ic_stat_icon` (Capacitor ne genera una di
   default; per una custom: `android/app/src/main/res/drawable/`).

Niente server: sono **notifiche locali**, pianificate sul dispositivo.

## ❤️ Apple Salute (HealthKit) / Health Connect
Predisposto in `src/platform/health.ts` (funzioni `connect()` /
`importRecentWorkouts()` già chiamate dalla UI in Attività → card Salute) e
le usage-string sono già in `ios/App/App/Info.plist`.

**iOS — passi:**
1. Installa un plugin HealthKit, es.:
   ```bash
   npm i @perfood/capacitor-healthkit
   npx cap sync
   ```
2. `npx cap open ios` → target **App** → **Signing & Capabilities** →
   **+ Capability** → **HealthKit**.
3. In `src/platform/health.ts` sostituisci i TODO con le chiamate reali del
   plugin in `connect()` (requestAuthorization) e `importRecentWorkouts()`
   (query HKWorkout → `createWorkout({ ..., source: 'healthkit' })`).
   **La UI non cambia.**
4. Build e prova su un **iPhone reale** (HealthKit non funziona nel simulatore).

**Android (Health Connect):**
1. `npm i <plugin Health Connect per Capacitor>` + `npx cap sync`
2. Aggiungi i permessi Health Connect nel manifest e la dichiarazione privacy.
3. Implementa le stesse funzioni con `source: 'healthconnect'`.

Nel frattempo, da subito (anche sul web), funziona l'**import da file**
(.tcx/.gpx/.xml) di Strava, Garmin e dell'export di Apple Salute.

## 📊 Widget schermata Home (fase 2)
I widget sono **codice nativo separato** (non riusano la WebView), quindi sono
un mini-progetto a parte da fare dopo il primo lancio.

**iOS (WidgetKit, SwiftUI):**
1. In Xcode: **File → New → Target → Widget Extension** (es. "VitaWidget").
2. Condividi i dati tra app e widget con un **App Group**
   (`group.app.vita.lifeos`) + `UserDefaults(suiteName:)`.
3. Quando l'app salva (es. acqua, anelli), scrivi i valori del giorno nell'App
   Group; il widget li legge e disegna anelli/acqua/prossimo task.
4. `WidgetCenter.shared.reloadAllTimelines()` per aggiornare.

**Android (Glance / AppWidgetProvider):**
1. Crea un `AppWidgetProvider` + layout nel progetto `android/`.
2. Leggi i dati condivisi (SharedPreferences) scritti dall'app.

Suggerimento: i dati sono già **per-giorno** (`waterLogs`, anelli derivati,
task con scadenza), quindi esporli al widget è semplice. Si può aggiungere un
piccolo "bridge" che scrive un riassunto giornaliero in un percorso condiviso.

## Riepilogo stato
| Funzione | Codice app | Da fare sul Mac |
|---|---|---|
| Notifiche locali | ✅ pronto | abilitare capability / permesso |
| Apple Salute | ✅ predisposto | plugin + capability HealthKit, riempire i TODO |
| Widget Home | ⚠️ da costruire | target nativo Widget (fase 2) |
