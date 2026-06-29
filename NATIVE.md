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

## ❤️ Apple Salute (HealthKit) / Health Connect — v1.2
**Già cablato** in `src/platform/health.ts` con il plugin **`capacitor-health`**
(compatibile Capacitor 8, copre sia HealthKit che Health Connect):
- `connect()` → richiede l'autorizzazione in lettura (allenamenti, calorie
  attive, passi, distanza, frequenza cardiaca).
- `importRecentWorkouts()` → importa gli allenamenti degli ultimi 30 giorni come
  `Workout` di Vyta (calorie, distanza, durata, HR), con de-dup per orario.
- `todaySummary()` + hook `useHealthSummary()` → calorie attive + passi di oggi;
  `mergeHealthRings()` alimenta gli **anelli** (Movimento = calorie attive,
  Allenamento = minuti, in Home e in Attività) quando l'utente è connesso.
- Su web/non connesso tutto è un no-op: comportamento invariato.

Già in repo: usage-string in `ios/App/App/Info.plist`
(`NSHealthShareUsageDescription`/`NSHealthUpdateUsageDescription`), entitlement
`ios/App/App/App.entitlements` (HealthKit) e `CODE_SIGN_ENTITLEMENTS` nel
progetto. Versione alzata a **1.2** (`MARKETING_VERSION`) build **2**.

**iOS — passi finali sul Mac:**
1. `npm install && npm run build && npx cap sync` (installa il pod del plugin).
2. `npx cap open ios` → target **App** → **Signing & Capabilities**: verifica che
   compaia **HealthKit** (l'entitlement è già nel progetto; se non appare,
   **+ Capability → HealthKit**).
3. Sul portale Apple Developer assicurati che l'**App ID** `app.vita.lifeos`
   abbia HealthKit abilitato (il profilo di provisioning lo richiede).
4. Build e prova su un **iPhone reale** (HealthKit non funziona nel simulatore):
   Attività → card "Salute" → **Connetti** → autorizza in Salute → "Importa".

**Android (Health Connect):** lo stesso plugin lo supporta. Servirà aggiungere i
permessi Health Connect nel manifest e la dichiarazione privacy quando vorrai
pubblicare anche lì (la UI usa già `source: 'healthconnect'`).

Funziona da subito anche l'**import da file** (.tcx/.gpx/.xml) di Strava, Garmin
e dell'export di Apple Salute, ovunque (web + native).

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
| Apple Salute | ✅ cablato (plugin + entitlement + anelli) | `cap sync` + verifica capability/App ID, prova su iPhone |
| Widget Home | ⚠️ da costruire | target nativo Widget (fase 2) |
