# Vyta — Guida completa alla pubblicazione (iOS)

Guida passo-passo, dall'inizio alla fine, per:
1. attivare e testare **Apple Health** dentro l'app,
2. attivare **Vyta Pro** (abbonamenti con RevenueCat),
3. configurare **App Store Connect**,
4. compilare, testare su **TestFlight** e **pubblicare**.

> Tutto il **codice** è già nel repo. Questa guida copre le parti che si fanno
> fuori dal codice (Mac/Xcode, portale Apple, RevenueCat) + i pochi flag da
> riempire nel codice. Dove serve agire nel codice è scritto **[CODICE]**.

---

## 0) Prerequisiti
- Un **Mac** con **Xcode** aggiornato.
- **Apple Developer Program** attivo (99 $/anno) → https://developer.apple.com
- **Node 20+** installato.
- Account **RevenueCat** (gratuito fino a una certa soglia) → https://www.revenuecat.com
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

## 3) RevenueCat — configurazione abbonamenti
RevenueCat gestisce ricevute, rinnovi e "ripristina acquisti" su iOS e Android.

1. Crea un account su RevenueCat e un **Project** (es. "Vyta").
2. **Project settings → Apps → + New → App Store**:
   - Inserisci il bundle id `app.vita.lifeos`.
   - Incolla l'**App-Specific Shared Secret** (lo trovi in App Store Connect →
     la tua app → **App Information → App-Specific Shared Secret**).
3. **Entitlements → + New**: crea un entitlement con identificativo **`pro`**
   (deve essere ESATTAMENTE `pro` — vedi `src/premium/config.ts`).
4. **Products**: aggiungi i due prodotti (li crei al punto 4 in App Store Connect):
   - `vyta.pro.monthly`
   - `vyta.pro.yearly`
   Collegali entrambi all'entitlement **`pro`**.
5. **Offerings → default**: crea due **Packages**:
   - **Annual** → `vyta.pro.yearly`
   - **Monthly** → `vyta.pro.monthly`
   (i tipi `ANNUAL` / `MONTHLY` sono quelli che l'app cerca, vedi `PRO_PACKAGE`.)
6. **Project settings → API keys**: copia la **Public SDK Key** iOS (inizia con `appl_`).

**[CODICE]** Incolla la chiave in `src/premium/config.ts`:
```ts
export const REVENUECAT_API_KEY = {
  ios: 'appl_LA_TUA_CHIAVE',   // ← qui
  android: '',
};
```
Appena c'è una chiave, **Vyta Pro si attiva**: l'app risolve l'abbonamento reale,
la pagina Pro mostra i **prezzi live** e i pulsanti fanno acquisto/ripristino veri.
(Con la chiave vuota resta "dormiente" e tutto è sbloccato gratis — lo stato della 1.2.)

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

### 4c) Crea gli abbonamenti
1. La tua app → **Monetization → Subscriptions** → crea un **Subscription Group**
   (es. "Vyta Pro").
2. Aggiungi due **auto-renewable subscriptions**:
   - **Reference Name:** Vyta Pro Mensile — **Product ID:** `vyta.pro.monthly` — durata 1 mese
   - **Reference Name:** Vyta Pro Annuale — **Product ID:** `vyta.pro.yearly` — durata 1 anno
   (i Product ID devono combaciare con RevenueCat, punto 3.4)
3. Per ciascuno imposta:
   - **Prezzo** (scegli la fascia),
   - **Localizzazione** (nome visualizzato + descrizione, almeno in italiano),
   - **Review information**: una **screenshot** della pagina Pro dell'app,
   - stato **"Ready to Submit"**.

### 4d) Privacy policy + Termini (OBBLIGATORI per gli abbonamenti)
- **App Information → Privacy Policy URL**: serve un URL pubblico.
- I **Termini d'uso (EULA)**: puoi usare l'EULA standard di Apple o la tua.
- L'app mostra già vicino al pulsante d'acquisto il testo legale e il pulsante
  **Ripristina** (richiesti da Apple, vedi `pro.legal` + "Ripristina acquisti").

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

**Test acquisti in sandbox** (gli IAP su TestFlight usano l'ambiente sandbox):
1. App Store Connect → **Users and Access → Sandbox → Testers**: crea un
   **Sandbox Apple ID** (email finta ma valida).
2. Sull'iPhone: **Impostazioni → Sviluppatore / App Store** → accedi col Sandbox account
   quando richiesto durante l'acquisto.
3. Nell'app: **Altro → Vyta Pro** → scegli piano → **Diventa Pro** → completa l'acquisto
   sandbox → deve comparire **"Abbonamento attivo"**.
4. Prova **Ripristina acquisti** dopo aver reinstallato.

---

## 8) Checklist QA finale in-app
- [ ] Home unificata si apre senza scroll, niente spazi bianchi (light + dark).
- [ ] Frase motivazionale cambia lingua con IT/EN.
- [ ] Salute: Connetti → permessi → "Sincronizzato oggi" con passi/kcal.
- [ ] Card **Passi** e anello **Movimento** popolati da Apple Health.
- [ ] Import allenamenti → compaiono nello Storico (nessun duplicato a re-import).
- [ ] Vyta Pro: prezzi live, acquisto sandbox, "Abbonamento attivo", ripristino.
- [ ] Notifiche locali (promemoria) chiedono il permesso e funzionano.

---

## 9) Invio per la review
1. App Store Connect → la tua app → versione **1.2** → compila:
   - **Screenshot** (6.7"/6.9" iPhone), **descrizione**, **keyword**, **URL supporto**,
     **Privacy Policy URL**, **categoria**, **fascia d'età**.
2. **App Privacy** (nutrition labels): dichiara
   - **Salute e fitness** (dati Health) — *non* collegati all'identità, *non* per tracking;
   - **Acquisti** (per gli abbonamenti).
3. Allega gli **abbonamenti** alla versione (la prima volta vengono recensiti insieme all'app).
4. **App Review Information → Notes:** spiega che
   - l'app legge Apple Health in **sola lettura** (allenamenti/passi/calorie) per
     mostrarli all'utente; nessun account necessario (app **offline**);
   - **Vyta Pro** è un abbonamento auto-rinnovabile che sblocca funzioni; per testarlo
     basta il sandbox.
5. **Submit for Review**.

---

## 10) Errori di review comuni (e come li abbiamo già evitati)
- **3.1.2 (abbonamenti):** vicino al pulsante d'acquisto servono prezzo, cosa include,
  **link a Termini e Privacy** e **Ripristina acquisti** → già presenti (`pro.legal`,
  pulsante Ripristina, lista feature, prezzi live).
- **5.1.3 (HealthKit):** i dati Salute non vanno usati per pubblicità/marketing e le
  usage-string devono essere chiare → già a posto (sola lettura, stringhe descrittive).
- **2.1 (IAP non testabili):** assicurati che il sandbox funzioni prima dell'invio.
- **Privacy policy mancante:** obbligatoria con HealthKit + abbonamenti → metti l'URL.
- **Banking/Tax non compilati:** gli IAP risultano "non disponibili" → completa il punto 4b.

---

## 11) Dove si "accende" Vyta Pro (riepilogo flag) — [CODICE]
File `src/premium/config.ts`:
- `REVENUECAT_API_KEY.ios` **vuoto** → Pro **off** (tutto gratis, pagina Pro "presto").
- `REVENUECAT_API_KEY.ios` **valorizzato** → Pro **on** (entitlement reale + prezzi live).
- `PRO_ENTITLEMENT_ID = 'pro'` deve combaciare con l'entitlement RevenueCat.
- `PRO_PACKAGE` (`ANNUAL`/`MONTHLY`) deve combaciare con i Package dell'offering.

**Importante:** oggi `can()` sblocca/blocca *globalmente* in base all'abbonamento, ma
**nessuna schermata è ancora "chiusa" dietro Pro**. Quando deciderai *cosa* rendere Pro
(es. Finanze, Obiettivi, Calendario, Statistiche), avvolgi quelle sezioni con un controllo
`usePremium().can('finances')` e mostra la pagina Pro se non attivo. Finché non lo fai,
l'abbonamento è acquistabile ma non limita nulla (scelta sicura per il primo rilascio).

---

## 12) Prossimi step (vedi ROADMAP.md)
- **1.3:** plugin Swift `HKActivitySummary` → Allenamento/In piedi **esatti** + **Sonno**;
  backup **Google/Drive** (occhio alla Guideline 4.8: con login Google serve anche
  "Accedi con Apple").
- **1.4:** Widget Home nativi (WidgetKit).
