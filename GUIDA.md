# GUIDA MASTER — Pubblicare Vyta 1.2 (build 35)

Guida unica, da zero, senza saltare passi. Copre: aggiornamento codice,
rimozione RevenueCat, Apple Salute, widget, abbonamenti (Vyta Pro) e invio su
App Store. Tempo: ~1,5–2 h la prima volta. Fai una PARTE alla volta.

Menu di Xcode in inglese (è così anche su Mac italiani).

---

## PREREQUISITI
- **Mac** con **Xcode** aggiornato · account **Apple Developer** attivo
- Il tuo **iPhone** + cavo
- **Paid Applications Agreement** + Tax/Banking → ✅ già fatti da te
- Gli **screenshot** che ti ho mandato (IT, EN, slide verde, paywall) salvati sul Mac

---

## PARTE 1 — Aggiornare il codice
Apri **Terminale** (`⌘+Spazio` → "Terminale"):
```
cd ~/percorso/della/cartella/vita
git fetch origin
git reset --hard origin/claude/vyta-candy-ui-restyle-hdzg0g     # NON git pull
npm install
```
- ⚠️ Se `npm install` dà errore **ERESOLVE** (il plugin abbonamenti dichiara
  Capacitor 6/7): rilancia con **`npm install --legacy-peer-deps`**.
- ℹ️ RevenueCat viene **rimosso da solo** (l'ho tolto dal codice); il plugin
  StoreKit nativo viene installato. Non devi fare altro lato RevenueCat.
```
npm run build          # deve finire con "✓ built"
npx cap sync ios       # "Sync finished" — rimuove RevenueCat e registra i plugin
npx cap open ios       # apre Xcode
```
✅ **Verifica:** `git reset` mostra *"HEAD is now at dd67d4a …"*; i 3 comandi finiscono senza errori; Xcode si apre.

---

## PARTE 2 — Firma (Signing)
1. Project Navigator (sinistra) → icona blu **App** in cima
2. **TARGETS → App** → scheda **Signing & Capabilities**
3. Spunta **Automatically manage signing** · **Team** = il tuo
4. **Bundle Identifier** = `app.vita.lifeos` · **Build** = **35** (non toccarlo)

✅ **Verifica:** nessun errore rosso sotto Signing.

---

## PARTE 3 — Verifica Apple Salute (HealthKit)
La capability è **già nel codice** (entitlements + Info.plist).
1. Sempre in **App → Signing & Capabilities**, controlla che sia elencata
   **HealthKit**.
2. Se NON c'è: **+ Capability** → **HealthKit** (aggiungilo; il testo dei
   permessi è già in Info.plist).

✅ **Verifica:** vedi le capability **HealthKit** (e a breve **App Groups**).

---

## PARTE 4 — App Group sull'app (per i widget)
1. **App → Signing & Capabilities → + Capability → App Groups**
2. Nel riquadro → **+** → scrivi `group.app.vita.lifeos` → Invio → **spunta ✓**

✅ **Verifica:** vedi `group.app.vita.lifeos` spuntato (e HealthKit è ancora lì).

---

## PARTE 5 — Creare il target Widget
1. **File → New → Target… → iOS → Widget Extension → Next**
2. Product Name **VytaWidgets** · Team il tuo · **Include Live Activity** = NON spuntato (e "Include Configuration App Intent" nemmeno) → **Finish**
3. Avviso "Activate scheme?" → **Activate**

✅ **Verifica:** compare la cartella gialla **VytaWidgets** a sinistra.

---

## PARTE 6 — Sostituire i file d'esempio
1. Apri **VytaWidgets** → seleziona **TUTTI i file `.swift`** dentro → tasto destro → **Delete → Move to Trash**
   - ✅ MANTIENI **Assets.xcassets** e **Info.plist**
2. **File → Add Files to "App"…** → `ios/widget/` → **`VytaWidgets.swift`**
3. **Add to targets**: spunta **SOLO VytaWidgets** (non App) → **Add**
4. Clicca il file → File Inspector (`⌥⌘1`) → **Target Membership** = solo VytaWidgets

✅ **Verifica:** in VytaWidgets c'è **un solo** `.swift` + Assets + Info.plist.

---

## PARTE 7 — App Group + iOS 17 sul widget
1. **TARGETS → VytaWidgets → Signing & Capabilities** → **Team** il tuo
2. **+ Capability → App Groups** → spunta `group.app.vita.lifeos` (identico!)
3. Scheda **General → Minimum Deployments → iOS 17.0**

✅ **Verifica:** stesso App Group dell'app + Min iOS 17.0.

---

## PARTE 8 — Provare su iPhone (widget + Salute)
1. Collega l'iPhone, sbloccalo, "Autorizza" il computer
2. Destinazione = **tuo iPhone** · schema **App** · ▶︎ **Run**
3. Prima volta: iPhone → **Impostazioni → Generali → VPN e gestione dispositivo** → Autorizza
4. All'avvio, l'app chiede l'accesso ad **Apple Salute** → consenti (verifica anelli/passi)
5. **Apri la Home** dell'app una volta (scrive i dati dei widget)
6. Home iPhone: tieni premuto → **+** → **Vyta** → aggiungi **Acqua / Lista / Abitudini** (scegli dimensione); Lista → tieni premuto → **Modifica widget** → Oggi/Settimana/To‑Do
7. Tocca una **goccia vuota** del widget Acqua → riapri l'app → l'acqua aumenta

✅ **Verifica:** i widget mostrano dati reali (non zeri). Se vuoti → App Group non identico (rivedi Parti 4 e 7) o app non aperta.

---

## PARTE 9 — Abbonamenti su App Store Connect (Vyta Pro)
appstoreconnect.apple.com → la tua app → **Monetization → Subscriptions**
1. **Create** un **Subscription Group** → Reference Name `Vyta Pro`
2. Crea 2 abbonamenti nel gruppo:
   - **`vyta_pro_monthly`** · Durata 1 Mese · Prezzo **€3,99**
   - **`vyta_pro_yearly`** · Durata 1 Anno · Prezzo **€29,99**
   ⚠️ I **Product ID devono essere esatti** come sopra.
3. Per **ciascuno** → **Introductory Offer → Create** → **Free Trial · 1 settimana** (nuovi abbonati, Italia/EU o tutti)
4. Per ciascuno: **Localizations** (Display Name + Description) in **IT** e **EN**
5. Per ciascuno: **Review Information** → carica 1 screenshot del **paywall**
6. Salva → stato **"Ready to Submit"**

---

## PARTE 10 — Versione 1.2 su App Store Connect
1. Vai alla versione **1.2** (creala con **(+) Version** se non c'è)
2. **Build** → **+** → seleziona il **build 35** (dopo l'upload, Parte 12)
3. **In-App Purchases** (nella pagina della versione) → **allega i 2 abbonamenti**
   (fondamentale: così vengono revisionati col build)
4. **Screenshot 6.9"** → carica IT (loc. Italiano) ed EN (loc. English)
5. **Novità di questa versione** → incolla i testi (in `RELEASE.md`)
6. **App Privacy** → deve restare **"Data Not Collected"** (StoreKit on-device, niente SDK terzi). Verifica che non sia rimasto "Purchases" da quando c'era RevenueCat.
7. **Privacy Policy URL** → metti un URL **reale e online** (aggiorna `PRIVACY_URL` in `src/premium/config.ts` se serve)
8. **Descrizione** → aggiungi in fondo il testo legale abbonamenti:
   > Vyta Pro è un abbonamento auto‑rinnovabile (€3,99/mese o €29,99/anno) con 7 giorni di prova gratuita. Pagamento sull'ID Apple alla conferma; si rinnova salvo disdetta almeno 24 h prima della fine del periodo. Gestiscilo in Impostazioni Account.

---

## PARTE 11 — Test Sandbox degli abbonamenti (PRIMA di inviare)
1. App Store Connect → **Users and Access → Sandbox → Testers → +** → crea un tester (email non già Apple ID)
2. Sull'iPhone, con l'app installata da Xcode: tocca un modulo **Pro**
   (Finanze/Obiettivi/Calendario) → appare il **paywall** → scegli un piano → **acquista**
3. Ti chiede di accedere con l'**account Sandbox** → completa
4. ✅ **Verifica:** i moduli Pro si sbloccano · chiudi/riapri l'app → resta Pro · **Ripristina acquisti** funziona · in sandbox trial/rinnovi sono accelerati

---

## PARTE 12 — Archivio + Upload + Invio
1. Destinazione → **Any iOS Device (arm64)** · schema **App**
2. **Product → Clean Build Folder** (`⇧⌘K`) → **Product → Archive**
3. Organizer → **Distribute App → App Store Connect → Upload → Next** (default) → **Upload**
4. Attendi "Upload successful" (build 35 in elaborazione 15–60 min) → poi torna alla **Parte 10 punto 2** e seleziona il build
5. **Export Compliance** → esente (solo HTTPS) · **IDFA** → No
6. **Add for Review → Submit** (con i 2 IAP allegati)

✅ **Verifica:** stato → *Waiting for Review*.

---

## ⚠️ PROBLEMI COMUNI
- **`npm install` ERESOLVE** → usa `npm install --legacy-peer-deps`
- **"Signing requires a development team"** → manca il Team su un target (Parti 2/7)
- **Doppio `@main`** in compilazione → non hai cancellato tutti i `.swift` d'esempio (Parte 6)
- **"AppIntentConfiguration only available in iOS 17"** → Min Deployment widget = iOS 17 (Parte 7)
- **Widget a zero** → App Group diverso o app non aperta (Parti 4/7/8)
- **Paywall: prezzi non caricano / acquisto fallisce** → prodotti non in "Ready to Submit" o account Sandbox non impostato (Parti 9/11)
- **Salute non chiede permesso** → capability HealthKit mancante (Parte 3)
- **Build non appare in ASC** → ancora "in elaborazione", aspetta e ricarica

---

## 🔑 CHIAVI
- Branch `claude/vyta-candy-ui-restyle-hdzg0g` · **1.2 / build 35** · commit `dd67d4a`
- App Group (su entrambi i target): `group.app.vita.lifeos`
- Bundle: app `app.vita.lifeos` · widget `app.vita.lifeos.VytaWidgets`
- Prodotti: `vyta_pro_monthly` (€3,99) · `vyta_pro_yearly` (€29,99) · trial 7 giorni
- Aggiorna con `git reset --hard origin/<branch>` (mai `git pull`)
- Min iOS widget: **17.0**
