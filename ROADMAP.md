# Vyta — Roadmap

Promemoria delle versioni e delle scelte fatte. Aggiornare a ogni rilascio.

---

## ✅ 1.2 — Candy UI, Home unificata, Apple Health (in corso → TestFlight)

**Fatto:**
- **Restyle "candy / soft-pastel"** (solo presentation layer): token, card
  arrotondate, ombre morbide, font rounded, chip colorate per modulo, bottom-nav
  flottante + FAB coral, Stella con orb iridescente. Dark mode adattato.
- **Home unificata e fissa** (non più dashboard a widget): panda + Momentum +
  anelli, card frase motivazionale sotto il panda, acqua, collegamenti ai moduli.
  Una sola schermata, niente scroll.
- **Connessione Apple Health** (`capacitor-health`, Capacitor 8):
  - ✅ Reali: **Movimento** (calorie attive), **Passi** (card con barre 7 giorni),
    **import allenamenti** (calorie/distanza/durata/battito).
  - ⚠️ Approssimati dai tuoi allenamenti: **Allenamento** (min), **In piedi** (ore).
  - ❌ Non presenti: **Sonno** e i valori *esatti* Apple di Allenamento/In piedi.
- iOS: entitlement HealthKit + usage-string, versione **1.2 (build 2)**.

**Da finalizzare sul Mac (vedi `NATIVE.md`):**
`npm install && npm run build && npx cap sync` → capability HealthKit + App ID con
HealthKit abilitato → Archive → TestFlight.

---

## 🔜 1.3 — Apple Health completo + backup Google

**Anelli esatti + Sonno (plugin Swift):**
- Mini plugin **Swift** che legge `HKActivitySummary` → **Movimento + Allenamento +
  In piedi ESATTI** in un'unica query (sostituisce le approssimazioni della 1.2).
- Card **Sonno** da `HKCategoryType.sleepAnalysis`.
- Registrazione del file Swift nel progetto Xcode: **tentativo automatico** su
  `project.pbxproj` (se la struttura non torna, drag&drop del file in Xcode).
- Codice nativo → validazione su **TestFlight** (HealthKit non gira nel simulatore).

**Backup Google (Gmail/Drive):**
- Obiettivo: mantenere i dati anche dopo disinstallazione/nuovo dispositivo.
- Da decidere lo scope:
  - **A) Backup su Google Drive** (più semplice, resta offline-first, sync su
    richiesta del file `.vita.json` già prodotto da `src/features/backup`).
  - **B) Sync multi-dispositivo** in tempo reale (molto più complesso: gestione
    conflitti, account).
- ⚠️ **Vincolo App Store (Guideline 4.8):** se aggiungiamo login Google, Apple
  obbliga a offrire anche **"Accedi con Apple"**. Serve introdurre un sistema di
  account (oggi l'app è senza account) + privacy policy + privacy labels.
- Nel frattempo i dati sono già protetti dal **backup su file** (export/import su
  iCloud/Drive/File) già presente nell'app.

---

## 🗓️ 1.4 — Widget schermata Home

- Widget **nativi** (non riusano la WebView), mini-progetto a parte:
  - **iOS:** target **WidgetKit/SwiftUI** + **App Group** (`group.app.vita.lifeos`)
    per condividere i dati del giorno (anelli, acqua, prossimo task).
  - **Android:** `AppWidgetProvider` / Glance che legge i dati condivisi.
- I dati sono già **per-giorno**, quindi esporli al widget è semplice (un piccolo
  "bridge" che scrive un riassunto giornaliero in un percorso condiviso).

---

## 📌 Principi da non rompere
- App **100% offline**, Stella offline (nessuna API esterna).
- Nessuna modifica gratuita a logica di business / schema Dexie / migrazioni.
- Accessibilità (contrasto AA, focus, tap ≥ 44px) e **safe-area** Capacitor.
- Mantenere il dark mode.
