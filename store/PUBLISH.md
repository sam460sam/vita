# Pubblicare Vita sull'App Store — guida passo passo

Hai già l'**Apple Developer Program** pagato (99 €/anno) → ottimo, sei pronto.
Questa è la tua prima pubblicazione: segui in ordine. Tempo realistico: mezza
giornata + 1–2 giorni di attesa per la review di Apple.

Serve: un **Mac** con **Xcode** installato (gratis dal Mac App Store) e un
**iPhone** per provare.

---

## FASE 0 — Controllo diritti / copyright (leggi prima)
Risultato dell'audit (giugno 2026):
- **Codice e librerie:** tutte open-source con licenze permissive (React, Vite,
  Tailwind MIT · Dexie Apache-2.0 · lucide-react ISC · Capacitor MIT). Uso
  commerciale consentito. ✅
- **Icone interfaccia:** lucide (ISC), libere. ✅
- **Font:** rimosso il caricamento esterno da Google Fonts → ora usa i **font di
  sistema** (San Francisco su iPhone). Nessun file di terzi incorporato, e la
  promessa "niente lascia il dispositivo" diventa 100% vera. ✅
- **Testi/dati demo:** originali. ✅
- ⚠️ **Logo e panda (TUA responsabilità):** l'icona "V a foglie" e il panda li
  hai forniti tu. Assicurati di **possederne i diritti** (creati da te, o
  generati/licenziati con uso commerciale consentito). Se vengono da immagini
  scaricate online senza licenza, vanno sostituiti. È l'unico punto che non
  posso verificare io.
- ⚠️ **Nome "Vita":** è una parola comune ma "Vita" da sola può confondersi con
  marchi esistenti (es. Sony **PS Vita**). Consigliato pubblicare come
  **"Vita — Life OS"** (o un nome più distintivo) e fare una ricerca veloce su
  App Store + su un registro marchi. Basso rischio, ma meglio saperlo.

---

## FASE 0 — Prepara il progetto (una volta)
Sul Mac, nella cartella del progetto:
```bash
npm install
npm run build
npx cap sync
sudo gem install cocoapods   # solo se non già installato
npx cap open ios
```
Questo apre **Xcode** sul progetto iOS.

---

## FASE 1 — Identità dell'app in Xcode
1. In Xcode seleziona il progetto **App** (in alto a sinistra) → tab **General**.
2. **Display Name:** `Vita`
3. **Bundle Identifier:** `app.vita.lifeos` (deve essere unico; se occupato usa
   `com.tuonome.vita`).
4. **Version:** `1.0.0` · **Build:** `1`
5. Tab **Signing & Capabilities** → spunta **Automatically manage signing** →
   scegli il tuo **Team** (il tuo account Developer).
   - Se vuoi i promemoria: il plugin notifiche è già incluso, non serve altro.
   - (Facoltativo, in futuro) **+ Capability → HealthKit** per Apple Salute.

## FASE 2 — Prova su iPhone vero
1. Collega l'iPhone via cavo, selezionalo come destinazione in alto.
2. Premi **▶ (Run)**. La prima volta su iPhone: Impostazioni → Generali →
   VPN e gestione dispositivi → fidati del tuo certificato sviluppatore.
3. Usa l'app qualche minuto: crea un'abitudine, logga acqua, ecc.

---

## FASE 3 — Crea l'app su App Store Connect
1. Vai su **https://appstoreconnect.apple.com** → **Le mie app** → **+** →
   **Nuova app**.
2. Compila:
   - **Piattaforma:** iOS
   - **Nome:** `Vita — Life OS` (se "Vita" da solo è occupato)
   - **Lingua principale:** Italiano
   - **Bundle ID:** scegli `app.vita.lifeos` (lo stesso di Xcode)
   - **SKU:** `vita-001` (codice interno libero)
3. Crea.

## FASE 4 — Compila la scheda (usa store/LISTING.md)
Nella pagina dell'app, sezione **1.0 Pronta per l'invio**:
- **Sottotitolo, Descrizione, Parole chiave, Testo promozionale** → copia da
  `store/LISTING.md` (IT; aggiungi EN come lingua extra se vuoi).
- **URL Privacy:** `https://vita-peach.vercel.app/privacy.html`
- **Categoria:** Salute e fitness (primaria), Produttività (secondaria).
- **Screenshot** (obbligatori): vedi FASE 6.
- **App Privacy** (sezione separata): rispondi **"Non vengono raccolti dati"**
  (Data Not Collected). È vero: tutto resta sul dispositivo.
- **Prezzo e disponibilità:** Gratis, tutti i paesi.
- **Fascia d'età:** 4+.

---

## FASE 5 — Carica il build da Xcode
1. In Xcode, destinazione in alto: scegli **Any iOS Device (arm64)**.
2. Menu **Product → Archive**. Attendi la compilazione.
3. Si apre **Organizer** → seleziona l'archivio → **Distribute App** →
   **App Store Connect** → **Upload** → avanti fino a **Upload**.
4. Dopo ~5–15 min il build appare in App Store Connect (sezione **Build**).
5. Nella pagina 1.0 dell'app, in **Build**, premi **+** e seleziona il build
   caricato.

## FASE 6 — Screenshot (obbligatori)
Apple chiede screenshot per iPhone 6.7" (1290×2796) e idealmente 6.5".
Più semplice: usa il **simulatore iPhone 15 Pro Max** in Xcode (Cmd+S per
salvare screenshot) sulle schermate migliori:
1. Home a widget (la dashboard personalizzabile in stile Apple)
2. Premi & Sfide (livelli, badge, panda) o la celebrazione "Daily Win"
3. Abitudini (heatmap) o Riepilogo settimanale con insight
4. Attività / Peso (BMI) o il digiuno intermittente
5. Finanze (flusso "dove vanno i soldi")
Carica 3–5 immagini. (Posso prepararti delle versioni "promo" se vuoi.)

---

## FASE 7 — Invia per la revisione
1. In alto nella pagina dell'app: **Aggiungi per la revisione** / **Invia**.
2. Domande review: "Usa IDFA?" → **No**. Login richiesto? → **No**.
3. **Invia.** Stato → "In attesa di revisione" → "In revisione" → di solito
   **24–48h** → "Pronta per la vendita". 🎉

---

## E gli aggiornamenti dopo? (la tua domanda)
Sì, continuiamo **insieme come ora**. Per ogni aggiornamento:
1. Io faccio le modifiche → push su `main` (il sito web si aggiorna subito).
2. Tu sul Mac: `git pull` → `npm run build` → `npx cap sync`.
3. In Xcode alza il numero **Build** (es. 1 → 2) e, se è una release, la
   **Version** (es. 1.0.0 → 1.1.0).
4. **Product → Archive → Distribute** (come FASE 5).
5. In App Store Connect crea una nuova versione (es. 1.1), seleziona il build,
   **Invia**. Review di nuovo ~1–2 giorni.

I **dati degli utenti restano sempre salvi** tra un aggiornamento e l'altro
(il database ha le migrazioni di versione). Non si perde nulla.

> Suggerimento: i fix piccoli si possono raggruppare. Non serve inviare ad ogni
> modifica — si fa una release quando c'è un insieme di miglioramenti pronti.

---

## Problemi comuni
- **"Bundle ID già in uso":** cambialo in `com.tuonome.vita` ovunque (Xcode +
  App Store Connect devono combaciare).
- **Build non appare:** attendi qualche minuto; controlla l'email per eventuali
  problemi di firma/ICloud.
- **Rifiuto review:** Apple di solito spiega il motivo con un link. I motivi
  tipici (app incompleta, privacy mancante) qui non si applicano: l'app è ricca
  e la privacy c'è. Se capita, mandami il messaggio e lo risolviamo.
