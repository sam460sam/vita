# Vyta — Guida completa alla pubblicazione (iOS)

Guida passo-passo, dall'inizio alla fine, per:
1. attivare e testare **Apple Health** dentro l'app,
2. attivare l'**abbonamento** (**7 giorni di prova gratis**, poi **€2,99/mese** — paywall Superwall, reinstall-proof),
3. configurare **App Store Connect**,
4. compilare, testare su **TestFlight** e **pubblicare**.

> Tutto il **codice** è già nel repo. Questa guida copre le parti che si fanno
> fuori dal codice (Mac/Xcode, portale Apple, Superwall) + i pochi flag da
> riempire nel codice. Dove serve agire nel codice è scritto **[CODICE]**.

---

## 0) Prerequisiti
- Un **Mac** con **Xcode** aggiornato.
- **Apple Developer Program** attivo (99 $/anno) → https://developer.apple.com
- **Node 20+** installato.
- Account **Superwall** (gratuito fino a una certa soglia) → https://superwall.com
- Bundle id dell'app: **`app.vita.lifeos`** (già impostato).

Primo allineamento del progetto nativo:
```bash
git checkout claude/vyta-candy-ui-restyle-hdzg0g   # il branch della 1.2
npm install
npm run build
npx cap sync          # copia il web build + installa i pod dei plugin (health, revenuecat)
```

---

## 1) Portale Apple Developer — App ID e Capabilities
1. Vai su https://developer.apple.com/account → **Certificates, IDs & Profiles** → **Identifiers**.
2. Apri (o crea) l'App ID **`app.vita.lifeos`**.
3. Abilita le capability:
   - ✅ **HealthKit**
   - ✅ **In-App Purchase** (di solito già attiva di default)
4. Salva. (Il provisioning automatico di Xcode rigenererà i profili.)

---

## 2) Apple Health (HealthKit)
Già pronto nel repo: entitlement `ios/App/App/App.entitlements`, le usage-string in
`ios/App/App/Info.plist` (`NSHealthShareUsageDescription` / `NSHealthUpdateUsageDescription`)
e tutta la logica in `src/platform/health.ts`.

**In Xcode:**
1. `npx cap open ios`
2. Target **App** → **Signing & Capabilities** → scegli il tuo **Team**.
3. Verifica che ci sia il riquadro **HealthKit** (l'entitlement è già nel progetto;
   se non appare: **+ Capability → HealthKit**).

**Cosa sincronizza la 1.2** (plugin `capacitor-health`):
- ✅ **Movimento** (calorie attive) → anello Movimento
- ✅ **Passi** → card "Passi" in Attività (totale oggi + barre 7 giorni)
- ✅ **Import allenamenti** (calorie, distanza, durata, battito)
- ⚠️ **Allenamento (min)** e **In piedi (ore)**: approssimati dagli allenamenti
- ❌ **Sonno** e i valori *esatti* Apple di Allenamento/In piedi → previsti in **1.3**
  (mini plugin Swift su `HKActivitySummary`, vedi `ROADMAP.md`).

**Verifica in-app (su iPhone reale — HealthKit NON funziona nel simulatore):**
1. Apri **Attività** → card **Salute** → **Connetti**.
2. iOS mostra il pannello permessi di Salute → consenti **tutto**.
3. La card mostra **"Sincronizzato oggi"** con **passi** e **kcal** letti da Salute.
4. Premi **Importa allenamenti** → compaiono nello **Storico** e alimentano gli anelli.
5. Controlla la card **Passi** e l'anello **Movimento** nella schermata Attività e in Home.

---

## 3) Superwall — paywall con 7 giorni gratis (→ €2,99/mese), reinstall-proof
**Modello:** all'avvio, se l'utente non è abbonato, parte il **paywall Superwall**
("7 giorni gratis, poi €2,99/mese"). L'utente avvia la **prova gratuita**; durante i
7 giorni non c'è addebito, poi si rinnova a €2,99/mese.

> ✅ **Reinstallazione = paga comunque.** La settimana gratis è la **prova introduttiva
> (introductory offer)** del prodotto su App Store Connect (punto 4c). Apple traccia
> l'idoneità alla prova **per Apple ID**, quindi chi l'ha già usata **non** la riottiene
> reinstallando o disdicendo.

Passi:
1. Crea un account su https://superwall.com e un'app (bundle id `app.vita.lifeos`).
2. **Settings → Keys**: copia la **Public API Key** iOS (inizia con `pk_`).
3. Collega il prodotto `vyta.monthly` (€2,99/mese con prova 7 giorni, punto 4c) e disegna
   il **paywall** (titolo "7 giorni gratis", prezzo, pulsanti **Abbonati** e **Ripristina**,
   link **Termini** e **Privacy** — richiesti da Apple).
4. **Campaigns → New**: campagna con **Placement** = `campaign_trigger`
   (= `PAYWALL_PLACEMENT` in `src/premium/config.ts`) e **Feature gating = Gated**.

**[CODICE]** Incolla la chiave in `src/premium/config.ts`:
```ts
export const SUPERWALL_API_KEY = {
  ios: 'pk_LA_TUA_CHIAVE',   // ← qui
  android: '',
};
export const PAYWALL_PLACEMENT = 'campaign_trigger'; // = placement su Superwall
export const TRIAL_DAYS = 7;        // durata prova (solo per le scritte in-app)
export const PRICE_FALLBACK = '€2,99';
```
Con la chiave vuota resta "dormiente": **niente paywall, tutto gratis** (lo stato 1.2).

Poi:
```bash
npm run build && npx cap sync
```

---

## 4) App Store Connect — creare l'app e gli abbonamenti
### 4a) Crea l'app
1. https://appstoreconnect.apple.com → **My Apps → + → New App**.
2. Piattaforma iOS, nome **Vyta**, lingua principale, bundle id `app.vita.lifeos`, SKU a piacere.

### 4b) Accordi, fiscale e bancario (OBBLIGATORIO per gli IAP)
- **Business → Agreements, Tax, and Banking**: accetta il **Paid Apps Agreement** e
  compila dati **bancari** e **fiscali**. Senza questo gli abbonamenti **non funzionano**.

### 4c) Crea l'abbonamento €2,99/mese
1. La tua app → **Monetization → Subscriptions** → crea un **Subscription Group**
   (es. "Vyta").
2. Aggiungi **un'auto-renewable subscription**:
   - **Reference Name:** Vyta Mensile — **Product ID:** `vyta.monthly` — durata **1 mese**
   - **Prezzo:** la fascia corrispondente a **€2,99**.
   - **Localizzazione** (nome visualizzato + descrizione, almeno in italiano).
   - **Review information**: una **screenshot** del paywall.
3. **Introductory Offer → +**: tipo **Free trial**, durata **1 settimana (7 giorni)**,
   per nuovi abbonati. *(Questa è la "settimana gratis" tracciata da Apple per Apple ID:
   non si ripristina reinstallando.)*
4. Stato **"Ready to Submit"**.
5. Il **Product ID `vyta.monthly`** deve combaciare con quello collegato in Superwall (punto 3).

### 4d) Privacy policy + Termini (OBBLIGATORI per gli abbonamenti)
- **App Information → Privacy Policy URL**: serve un URL pubblico.
- I **Termini d'uso (EULA)**: puoi usare l'EULA standard di Apple o la tua.
- Sul **paywall Superwall** inserisci prezzo, durata, prova, **Ripristina** e i link a
  **Termini** e **Privacy** (Apple li richiede vicino al pulsante d'acquisto).

---

## 5) Versioni e build
**[CODICE]** A ogni invio aumenta la build (e la versione quando rilasci nuove feature):
- iOS: `MARKETING_VERSION` e `CURRENT_PROJECT_VERSION` in
  `ios/App/App.xcodeproj/project.pbxproj` (oggi: **1.2 / build 2**).
- `package.json` → `version` (oggi `1.2.0`).

```bash
npm run build && npx cap sync
npx cap open ios
```

---

## 6) Archive e upload (Xcode)
1. In Xcode seleziona **Any iOS Device (arm64)** come destinazione.
2. **Product → Archive**.
3. Ad archive completato: **Distribute App → App Store Connect → Upload**.
4. Attendi l'elaborazione su App Store Connect (qualche minuto).

---

## 7) TestFlight (test reale, incluso Apple Health + acquisti)
1. App Store Connect → la tua app → **TestFlight**.
2. Aggiungi te stesso come **Internal Tester** (Users and Access).
3. Installa l'app **TestFlight** sull'iPhone e scarica la build.

**Test Apple Health:** segui la checklist del punto 2 (su device reale).

**Test prova gratuita + acquisto in sandbox** (gli IAP su TestFlight usano il sandbox):
1. App Store Connect → **Users and Access → Sandbox → Testers**: crea un
   **Sandbox Apple ID** (email finta ma valida).
2. Sull'iPhone: **Impostazioni → App Store → Sandbox Account** → accedi col tester.
3. Avvia Vyta da TestFlight: all'ingresso compare il **paywall** con
   **"7 giorni gratis, poi €2,99/mese"** → avvia la **prova** → l'app si sblocca.
4. **Verifica reinstallazione:** disinstalla e reinstalla con lo **stesso Sandbox Apple ID**
   → il paywall **non** offre di nuovo la settimana gratis (deve far pagare) ✅.
5. Prova **Ripristina** dal paywall.

---

## 8) Checklist QA finale in-app
- [ ] Home unificata si apre senza scroll, niente spazi bianchi (light + dark).
- [ ] Frase motivazionale cambia lingua con IT/EN.
- [ ] Salute: Connetti → permessi → "Sincronizzato oggi" con passi/kcal.
- [ ] Card **Passi** e anello **Movimento** popolati da Apple Health.
- [ ] Import allenamenti → compaiono nello Storico (nessun duplicato a re-import).
- [ ] Paywall all'ingresso: "7 giorni gratis, poi €2,99/mese" → avvia prova → sblocca.
- [ ] Reinstallazione con stesso Apple ID → niente nuova prova gratis (paga) ✅.
- [ ] Notifiche locali (promemoria) chiedono il permesso e funzionano.

---

## 9) Invio per la review
1. App Store Connect → la tua app → versione **1.2** → compila:
   - **Screenshot** (6.7"/6.9" iPhone), **descrizione**, **keyword**, **URL supporto**,
     **Privacy Policy URL**, **categoria**, **fascia d'età**.
2. **App Privacy** (nutrition labels): dichiara
   - **Salute e fitness** (dati Health) — *non* collegati all'identità, *non* per tracking;
   - **Acquisti** (per gli abbonamenti).
3. Allega l'**abbonamento** alla versione (la prima volta viene recensito insieme all'app).
4. **App Review Information → Notes:** spiega che
   - l'app legge Apple Health in **sola lettura** (allenamenti/passi/calorie) per
     mostrarli all'utente; nessun account necessario (app **offline**);
   - all'avvio c'è un **paywall** (Superwall) con **prova gratuita di 7 giorni** e poi
     **€2,99/mese**; per testarlo basta il Sandbox Apple ID.
5. **Submit for Review**.

---

## 10) Errori di review comuni (e come evitarli)
- **3.1.2 (abbonamenti):** sul **paywall Superwall** servono prezzo, durata, cosa include,
  **Ripristina** e **link a Termini e Privacy** → configurali nel paywall sulla dashboard.
- **5.1.3 (HealthKit):** i dati Salute non vanno usati per pubblicità/marketing e le
  usage-string devono essere chiare → già a posto (sola lettura, stringhe descrittive).
- **2.1 (IAP non testabili):** assicurati che il paywall + sandbox funzionino prima dell'invio.
- **3.1.1 (paywall che blocca tutto):** un hard paywall è ammesso, ma deve essere chiaro su
  prova/prezzo; se Apple obietta, valuta di mostrare un assaggio prima del paywall.
- **Privacy policy mancante:** obbligatoria con HealthKit + abbonamenti → metti l'URL.
- **Banking/Tax non compilati:** gli IAP risultano "non disponibili" → completa il punto 4b.

---

## 11) Dove si "accende" il paywall (riepilogo flag) — [CODICE]
File `src/premium/config.ts`:
- `SUPERWALL_API_KEY.ios` **vuoto** → paywall **off** (tutto gratis — stato 1.2).
- `SUPERWALL_API_KEY.ios` **valorizzato** → paywall **on**: all'avvio, se non abbonato,
  parte il paywall Superwall; ad abbonamento/prova attivi l'app si sblocca.
- `PAYWALL_PLACEMENT` deve combaciare col **placement** della campagna Superwall.
- `TRIAL_DAYS` (7) e `PRICE_FALLBACK` (€2,99) sono solo per le scritte in-app; la prova
  (7 giorni) e il prezzo "veri" stanno sul prodotto App Store Connect + sul paywall.

**Come funziona il gate:** `SubscriptionGate` (in `src/premium/SubscriptionGate.tsx`)
avvolge tutta l'app: se `requiresSubscription` (paywall on + non abbonato) presenta il
paywall Superwall e mostra dietro la schermata "Inizia la settimana di prova". Ad
abbonamento/prova attivi passa i `children` (l'app intera). La **prova di 7 giorni** è
l'introductory offer su App Store Connect, quindi è **a prova di reinstallazione**.

---

## 12) Prossimi step (vedi ROADMAP.md)
- **1.3:** plugin Swift `HKActivitySummary` → Allenamento/In piedi **esatti** + **Sonno**;
  backup **Google/Drive** (occhio alla Guideline 4.8: con login Google serve anche
  "Accedi con Apple").
- **1.4:** Widget Home nativi (WidgetKit).
