# Pubblicare Vyta sull'App Store — guida COMPLETA passo passo

> Prima pubblicazione, spiegata senza dare nulla per scontato.
> Tempo realistico: ~mezza giornata di lavoro + 1–2 giorni di attesa per la
> revisione di Apple. Puoi fermarti e riprendere quando vuoi.

---

## COSA TI SERVE (prerequisiti)
- ✅ **Apple Developer Program** già pagato (99 €/anno). — _ricordati: si rinnova
  ogni anno, altrimenti l'app sparisce dallo Store._
- Un **Mac** (obbligatorio per pubblicare su iOS).
- **Xcode** installato dal Mac App Store (gratis, ~10 GB, mettilo a scaricare ora).
- Un **iPhone** (consigliato per provare, non obbligatorio).
- Connessione e un po' di pazienza la prima volta.

---

## PARTE A — PREPARAZIONE SUL MAC

### A1. Installa gli strumenti (una volta sola)
Apri **Terminale** (Cmd+Spazio → scrivi "Terminale").
1. Installa **Homebrew** (se non ce l'hai):
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```
2. Installa **Node** e **CocoaPods**:
   ```bash
   brew install node
   brew install cocoapods
   ```
3. Apri **Xcode** una volta, accetta la licenza, lascia che installi i componenti.

### A2. Scarica il progetto
Sempre in Terminale:
```bash
cd ~/Documents
git clone https://github.com/sam460sam/vita.git
cd vita
git checkout claude/bold-darwin-6wgUf   # il ramo su cui lavoriamo
```
(Le volte successive ti basterà: `cd ~/Documents/vita && git pull`.)

### A3. Compila e apri il progetto iOS
```bash
npm install
npm run build
npx cap sync
npx cap open ios
```
- `npm run build` crea la versione web ottimizzata.
- `npx cap sync` la copia dentro il progetto iOS + installa i plugin (icone, ecc.).
- `npx cap open ios` apre **Xcode** sul progetto.

> Se `cap sync` dà errore sui "pods": esegui `cd ios/App && pod install && cd ../..`
> e riprova `npx cap open ios`.

---

## PARTE B — CONFIGURA L'APP IN XCODE

### B1. Identità e firma
1. In Xcode, nella colonna di sinistra clicca l'icona blu in alto **App** →
   al centro scheda **General**.
2. **Display Name:** `Vyta`
3. **Bundle Identifier:** `app.vita.lifeos`
   - È un codice tecnico interno (l'utente non lo vede): va bene anche se il
     brand è "Vyta". Deve solo essere **unico** e **identico** a quello che userai
     su App Store Connect.
   - Se ti dice che è già in uso, cambialo in `com.tuonome.vyta` (qui **e** su
     App Store Connect).
4. **Version:** `1.0.0`  ·  **Build:** `1`
5. Scheda **Signing & Capabilities**:
   - Spunta **Automatically manage signing**.
   - In **Team** scegli il tuo account Apple Developer (se non c'è: menu Xcode →
     Settings → Accounts → **+** → accedi col tuo Apple ID Developer).
   - Xcode crea da solo certificati e profili. ✅

> Non devi toccare HealthKit ora (è opzionale e per il futuro). La domanda sulla
> crittografia è già gestita nel progetto (export compliance = nessuna).

### B2. Prova che funzioni
**Sul simulatore** (veloce): in alto scegli "iPhone 15 Pro" e premi **▶ (Run)**.
L'app si apre nel simulatore.

**Su iPhone vero** (consigliato):
1. Collega l'iPhone col cavo, selezionalo come destinazione in alto.
2. Premi **▶**. La prima volta l'iPhone blocca l'app: vai su
   **Impostazioni → Generali → VPN e gestione dispositivi → [il tuo profilo] →
   Autorizza**. Riprova.
3. Usa l'app 5 minuti: completa l'onboarding, crea un'abitudine, logga acqua,
   prova a cambiare tema. Verifica che l'icona sia la **V verde**.

---

## PARTE C — CREA LA SCHEDA SU APP STORE CONNECT

### C1. Accordi (la primissima volta)
1. Vai su **https://appstoreconnect.apple.com** e accedi.
2. **Business / Accordi (Agreements, Tax, and Banking)**: accetta il contratto
   **"Apple Developer Program"** (gratuito). Per un'app **gratis** questo basta.
   - _Per il futuro (quando attiverai Vyta Pro a pagamento):_ qui dovrai accettare
     anche il **"Paid Apps Agreement"** e inserire **IBAN** + **dati fiscali**.
     Senza, non potrai incassare. Lo faremo quando aggiungeremo gli abbonamenti.

### C2. Crea l'app
1. **Le mie app → + (in alto a sinistra) → Nuova app**.
2. Compila:
   - **Piattaforma:** iOS
   - **Nome:** `Vyta — Life OS`
     - Se ti dice che il nome è già occupato → usa la **riserva**: `Vytal — Life OS`.
   - **Lingua principale:** Italiano
   - **Bundle ID:** seleziona `app.vita.lifeos` (lo stesso di Xcode)
   - **SKU:** `vyta-001` (un codice interno tuo, libero)
   - **Accesso utente completo:** Sì
3. **Crea**.

---

## PARTE D — COMPILA LA PAGINA DELL'APP (versione 1.0)

Nella pagina dell'app, sezione versione **1.0**:

### D1. Informazioni testuali (copia da `store/LISTING.md`)
- **Sottotitolo** (max 30 caratteri)
- **Descrizione** (lunga)
- **Parole chiave** (separate da virgola, max 100 caratteri)
- **Testo promozionale** (facoltativo, modificabile senza nuova review)

### D2. URL
- **URL Assistenza** (obbligatorio): puoi usare `https://vita-peach.vercel.app`
  per ora (o una pagina/email di contatto).
- **URL Privacy** (obbligatorio): `https://vita-peach.vercel.app/privacy.html`
- **URL Marketing:** facoltativo.

### D3. Categoria e info generali
- **Categoria primaria:** Salute e fitness  ·  **Secondaria:** Produttività
- **Diritti di contenuto:** dichiara che hai i diritti su testi/immagini (logo e
  panda creati con AI da te → ok).

### D4. Classificazione per età
Compila il questionario (tutte risposte "Nessuno/No" per Vyta) → risulterà **4+**.

### D5. Privacy dell'app ("App Privacy" — sezione a parte nel menu a sinistra)
- Alla domanda "Raccogli dati?" rispondi **"Non vengono raccolti dati"**
  (Data Not Collected). È vero: tutto resta sul dispositivo. ✅

### D6. Prezzo e disponibilità
- **Prezzo:** Gratis
- **Disponibilità:** tutti i paesi (o scegli tu).

---

## PARTE E — SCREENSHOT (obbligatori)

Apple richiede gli screenshot per **iPhone grande**: misura **6.9"**
(**1320 × 2868 px**, es. iPhone 16 Pro Max) **oppure** 6.7" (1290 × 2796).
Servono **da 3 a 10** immagini.

Come farli in 5 minuti:
1. In Xcode scegli il simulatore **iPhone 16 Pro Max** (o 15 Pro Max) e premi ▶.
2. Porta l'app sulle schermate migliori e premi **Cmd+S** (salva screenshot sul
   Desktop, già della misura giusta).
3. Schermate consigliate (3–5):
   1. **Home a widget** (la dashboard personalizzabile)
   2. **Premi & Sfide** o la celebrazione **Daily Win**
   3. **Abitudini** (heatmap) o **Riepilogo** con gli insight
   4. **Peso/BMI** o il **digiuno intermittente**
   5. **Finanze**
4. Caricale nella pagina dell'app (sezione Screenshot, iPhone 6.9").

> Te le posso preparare in versione "promo" (con cornice iPhone e una frase) se
> vuoi una resa più professionale: chiedimelo.

---

## PARTE F — CARICA IL BUILD DA XCODE

1. In Xcode, in alto come destinazione scegli **Any iOS Device (arm64)**
   (NON il simulatore).
2. Menu **Product → Archive**. Attendi (qualche minuto).
3. Si apre **Organizer** → seleziona l'archivio appena creato →
   **Distribute App** → **App Store Connect** → **Upload** → vai avanti con le
   opzioni di default fino a **Upload**.
4. Dopo **5–15 minuti** il build compare in App Store Connect (a volte arriva
   un'email "elaborazione completata").
5. Torna nella pagina **1.0** dell'app → sezione **Build** → premi **+** →
   seleziona il build caricato.

---

## PARTE G — INVIA PER LA REVISIONE

1. Controlla che tutto abbia la spunta verde (testi, screenshot, build, privacy).
2. In alto a destra: **Aggiungi per la revisione** / **Invia per la revisione**.
3. Domande finali:
   - **IDFA / pubblicità?** → No
   - **Login richiesto?** → No (l'app non ha account)
   - **Contenuti di terze parti?** → No
4. **Invia.** Stato: "In attesa di revisione" → "In revisione" → di solito entro
   **24–48 ore** → **"Pronta per la vendita"**. 🎉

> Quando è approvata, se hai scelto "rilascio automatico" va online da sola;
> altrimenti premi tu **Rilascia (Release)**.

---

## ✅ RICORDA PER IL FUTURO (cose che dovrai fare)

**Ogni aggiornamento dell'app:**
1. Io faccio le modifiche → push (il sito web si aggiorna subito).
2. Tu sul Mac: `git pull` → `npm run build` → `npx cap sync`.
3. In Xcode alza il **Build** (1 → 2…) e, per una release vera, la **Version**
   (1.0.0 → 1.1.0).
4. **Product → Archive → Distribute** (come PARTE F).
5. Su App Store Connect: crea nuova versione (es. 1.1), seleziona il build,
   **Invia**. Review di nuovo ~1–2 giorni.
   > I **dati degli utenti restano salvi** tra un aggiornamento e l'altro.

**Scadenze e manutenzione:**
- 🔁 **Rinnova l'Apple Developer Program ogni anno** (altrimenti l'app sparisce).
- 🔒 Tieni **online la pagina privacy** (`/privacy.html`): se sparisce, Apple può
  rimuovere l'app.
- 💬 Controlla ogni tanto **recensioni e segnalazioni** su App Store Connect.

**Quando vorrai far PAGARE (Vyta Pro):**
- Accetta il **Paid Apps Agreement** + inserisci **IBAN e dati fiscali** in
  *Business → Agreements, Tax, and Banking*.
- Crea i prodotti **abbonamento** (es. 3 €/mese, 30 €/anno) in App Store Connect.
- Collega i pagamenti nell'app (consigliato **RevenueCat**) — lo facciamo insieme.
- Apple incassa, trattiene 15% (Small Business Program, da richiedere) e ti versa
  il resto sul tuo IBAN ~mensilmente.

**Cose facoltative ma utili (prossimi prompt):**
- **TestFlight**: far provare l'app ad amici prima del lancio (build → TestFlight).
- **Apple Health** (lettura allenamenti/peso) — aggiunge valore.
- **Account cloud + sync** (Supabase) se un giorno vorrai il login multi-dispositivo.
- **Screenshot promo** professionali + ottimizzazione testi (ASO).

---

## ❗ PROBLEMI COMUNI
- **"Bundle ID già in uso":** cambialo in `com.tuonome.vyta` in Xcode **e** su
  App Store Connect (devono combaciare).
- **Build non appare in App Store Connect:** aspetta 10–15 min; controlla l'email
  per eventuali problemi di firma.
- **"Nome app non disponibile":** usa `Vytal — Life OS` (riserva).
- **Rifiuto della review:** Apple spiega sempre il motivo con un link. Mandami il
  messaggio e lo risolviamo insieme — i motivi tipici (app incompleta, privacy
  mancante) qui non si applicano.

---

_Quando sei sul Mac e arrivi a un punto in cui hai un dubbio (firma in Xcode,
schermata di App Store Connect, un errore), mandami uno screenshot e ti guido in
diretta su quel passaggio._
