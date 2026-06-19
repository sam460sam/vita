# Vyta — Guida da computer: aggiornare l'app + configurare i pagamenti

> Guida operativa per quando sei **al Mac**. Due cose distinte:
> 1) **Ripubblicare l'app** dopo le modifiche grosse (UI/UX nuova, mascotte Vio, screenshot).
> 2) **Pagamenti / Vyta Pro** su App Store Connect (per il futuro).
>
> ⚠️ Le date e i numeri qui sono lo stato del repo al 2026-06-19:
> `MARKETING_VERSION = 1.0`, build `1`, bundle `app.vita.lifeos`.

---

## PARTE 0 — STATO ATTUALE (leggere prima)

- **Pagamento NON implementato nel codice.** In `src/premium/premium.tsx` c'è
  `UNLOCK_ALL_FOR_NOW = true`: tutte le funzioni sono sbloccate, non c'è nessun
  prodotto StoreKit/abbonamento collegato. L'architettura è pronta per RevenueCat,
  ma il billing va ancora scritto.
- **Conseguenza:** oggi Vyta può uscire **solo come app GRATUITA**. Per far pagare
  Vyta Pro servono prima: (a) implementare il billing nel codice, (b) configurare i
  prodotti e i contratti su App Store Connect. Vedi PARTE 4.
- **Dati salvati nel repo** (`store/`): `HANDOFF.md` (contesto + testi ASO Vio),
  `PUBLISH.md` (guida lancio), `LISTING.md` (testi ASO — ancora vecchia versione
  "Stella/Life OS", da aggiornare a Vio), `screenshots-appstore/` (i 9 screenshot
  finiti IT 5 + EN 4; manca EN Privacy).

### Decisione da prendere
- **Opzione A (consigliata): lancia ORA gratis (1.0).** Niente contratti a pagamento,
  niente codice billing. Aggiungi Vyta Pro in un update successivo (1.1).
- **Opzione B: lancia già con Vyta Pro a pagamento.** Più lavoro: prima il codice
  billing, poi i contratti e i prodotti. Allunga i tempi e la review.

Il resto della guida è ordinato per l'**Opzione A**; la PARTE 4 copre l'Opzione B / il
futuro Pro.

---

## PARTE 1 — PREREQUISITI SUL MAC (una volta sola)

Apri **Terminale**.
```bash
# Homebrew (se manca)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
brew install node cocoapods
```
Apri **Xcode** una volta, accetta la licenza, lascia installare i componenti.

---

## PARTE 2 — AGGIORNARE / RICOMPILARE L'APP (dopo le modifiche grosse)

### 2.1 Scarica le ultime modifiche
```bash
cd ~/Documents/vita    # se non ce l'hai: git clone https://github.com/sam460sam/vita.git
git fetch origin
git checkout claude/new-session-6npcsf   # il ramo aggiornato
git pull origin claude/new-session-6npcsf
```

### 2.2 Build web + sync nativo
```bash
npm install
npm run build
npx cap sync
# se cap sync dà errore "pods":
#   cd ios/App && pod install && cd ../..
npx cap open ios
```
- `npm run build` = versione web ottimizzata.
- `npx cap sync` = la copia dentro iOS + aggiorna i plugin.
- `npx cap open ios` = apre Xcode.

### 2.3 Alza i numeri di versione in Xcode
Poiché l'app è cambiata molto:
- Se la **1.0 NON è ancora mai stata pubblicata** → puoi lasciare **Version 1.0**,
  **Build 1** (o portare Build a 2 se avevi già caricato un build su TestFlight/ASC).
- Se la **1.0 è già sullo Store** → metti **Version 1.1.0** e **Build** successivo.

In Xcode: icona blu **App** → **General** → *Version* e *Build*. (Oppure in
`ios/App/App.xcodeproj`: `MARKETING_VERSION` e `CURRENT_PROJECT_VERSION`.)

### 2.4 Firma e prova
- **Signing & Capabilities** → spunta *Automatically manage signing* → scegli il tuo
  **Team** (Apple Developer).
- Prova su **simulatore** (▶) e, meglio, su **iPhone vero**: completa onboarding,
  crea un'abitudine, logga acqua, fai il test, cambia tema. Verifica che compaia
  **Vio** e l'icona corretta.

### 2.5 Widget iOS (se presenti)
Se hai aggiunto i widget (`VytaWidgets.swift`), vanno compilati come **Widget Extension**
dentro Xcode (non si compilano fuori dal Mac). Verifica che il target widget compili e
che lo schema includa l'estensione prima dell'Archive.

### 2.6 Archivia e carica
1. Destinazione in alto: **Any iOS Device (arm64)** (NON simulatore).
2. **Product → Archive** (qualche minuto).
3. **Organizer** → seleziona l'archivio → **Distribute App** → **App Store Connect**
   → **Upload** → avanti con i default → **Upload**.
4. Dopo 5–15 min il build compare in App Store Connect (a volte arriva un'email).

---

## PARTE 3 — SCHEDA SU APP STORE CONNECT (dopo il cambio drastico)

Vai su https://appstoreconnect.apple.com → **Le mie app → Vyta** → versione.

### 3.1 Screenshot (rifatti con Vio)
- Carica i nuovi screenshot **iPhone 6.9" (1320×2868)** nelle DUE localizzazioni:
  - **Italiano:** i 5 file `store/screenshots-appstore/01..05-IT-*.png`
  - **Inglese:** i 4 file `06..09-EN-*.png` **+ EN Privacy** appena pronta.
- Ordine consigliato: Hero → Abitudini → Acqua → Test → Privacy.
- ⚠️ Rimuovi i vecchi screenshot (versione "Stella/Life OS") se presenti.

### 3.2 Testi ASO (versione Vio) — da `store/HANDOFF.md`
Aggiorna nome, sottotitolo, parole chiave, testo promozionale e descrizione in **IT** e
**EN**. (Nota: `store/LISTING.md` ha ancora i testi vecchi: usa quelli nuovi del HANDOFF,
o chiedimi di aggiornare LISTING.md.)
- 🇮🇹 Nome `Vyta: Abitudini e Benessere` · Sottotitolo `Cresci ogni giorno con Vio`
- 🇬🇧 Name `Vyta: Habits & Self-Care` · Subtitle `Grow every day with Vio`

### 3.3 Controlli perché l'app è cambiata molto
- **App Privacy** (menu a sinistra): conferma **"Non vengono raccolti dati"** (vero:
  tutto resta sul dispositivo, niente account/cloud/analytics).
- **Categoria:** Salute e fitness (primaria) · Produttività (secondaria).
- **Età:** rifai il questionario se serve → 4+.
- **URL:** Assistenza + Privacy (`https://vita-peach.vercel.app/privacy.html`) ancora validi.
- **Descrizione/screenshot** coerenti con la nuova UI (niente riferimenti a schermate
  rimosse).
- **"Novità di questa versione"** (se è un update): scrivi 2–3 righe (te le preparo IT/EN).

### 3.4 Seleziona il build e invia
- Sezione **Build** → **+** → scegli il build caricato dalla PARTE 2.
- In alto a destra **Aggiungi/Invia per la revisione**.
- Domande finali: IDFA/pubblicità → **No**; Login richiesto → **No**; Contenuti terzi → **No**.

---

## PARTE 4 — PAGAMENTI / VYTA PRO (futuro, Opzione B)

> Questa parte serve SOLO quando vuoi far pagare. Va fatta in **3 blocchi**: contratti,
> codice, prodotti.

### 4.1 Contratti e dati bancari (App Store Connect → Business)
In **Business → Agreements, Tax, and Banking**:
1. Accetta il **"Paid Applications Agreement"** (oltre a quello gratuito del Developer
   Program). Senza, non puoi vendere né incassare.
2. **Banking:** inserisci **IBAN** + intestatario per i pagamenti.
3. **Tax:** compila le **informazioni fiscali** (per l'Italia: i moduli fiscali Apple,
   es. W-8BEN per gli USA + dati locali). Apple non versa finché tutto è "Active".
4. (Consigliato) richiedi l'**Apple Small Business Program** → commissione **15%**
   invece di 30% (sotto 1M$/anno).

### 4.2 Codice: implementare il billing nell'app
Oggi `premium.tsx` ha `UNLOCK_ALL_FOR_NOW = true`. Serve:
- Scegliere il sistema: **RevenueCat** (consigliato, gestisce StoreKit + entitlement)
  oppure StoreKit 2 nativo.
- Collegare l'acquisto/ripristino e far derivare `isPremium` dall'**entitlement** reale
  (mettere `UNLOCK_ALL_FOR_NOW = false`).
- Aggiungere pulsanti **Acquista** / **Ripristina acquisti** nella pagina Pro.
- Gestire la **prova gratuita 3 giorni** (introductory offer).
> Questo è lavoro di sviluppo: lo facciamo insieme nel repo prima dell'update a pagamento.

### 4.3 Prodotti abbonamento (App Store Connect)
In **App → Monetizzazione → Abbonamenti**:
1. Crea un **Gruppo di abbonamenti** (es. "Vyta Pro").
2. Crea i prodotti dentro al gruppo:
   - **Mensile** — id es. `app.vita.lifeos.pro.monthly` — **€3,99/mese**
   - **Annuale** — id es. `app.vita.lifeos.pro.yearly` — **€29,99/anno**
3. **Prova gratuita:** aggiungi un'**Offerta introduttiva** = "Prova gratuita 3 giorni".
4. Compila per ogni prodotto: nome visualizzato, descrizione, fascia di prezzo,
   localizzazioni IT/EN, immagine di review.
5. Gli abbonamenti vanno **inviati in review insieme a un build** che li usa (per questo
   serve prima il codice della PARTE 4.2).

### 4.4 Note fiscali/legali
- Con abbonamenti servono anche **Termini d'uso (EULA)** e link nella scheda + nell'app.
- Apple trattiene 30% (o 15% Small Business) e versa il resto sull'IBAN ~mensilmente.

---

## CHECKLIST RAPIDA

**Lancio/aggiornamento (gratis, ora):**
- [ ] `git pull` → `npm install` → `npm run build` → `npx cap sync` → `npx cap open ios`
- [ ] Version/Build aggiornati in Xcode · Signing OK
- [ ] Provata su iPhone (Vio compare, niente crash)
- [ ] Archive → Distribute → Upload
- [ ] Screenshot Vio caricati (IT 5 + EN 5) · vecchi rimossi
- [ ] Testi ASO Vio (IT/EN) · App Privacy = "Dati non raccolti"
- [ ] Build selezionato · Invia per la revisione

**Pagamenti (futuro Pro):**
- [ ] Paid Apps Agreement + IBAN + fiscale "Active" · Small Business 15%
- [ ] Billing implementato nel codice (`UNLOCK_ALL_FOR_NOW = false`)
- [ ] Gruppo + prodotti abbonamento (mensile/annuale) + prova 3 giorni
- [ ] EULA/Termini · prodotti inviati in review col build
