# GUIDA COMPLETA — Pubblicare Vyta 1.2 (build 33) con i widget

Guida dettagliata, pensata come se fosse la prima volta. Segui i passi **in
ordine**, senza saltarne. Tempo stimato: 45–90 min (la prima volta).

Menu di Xcode in inglese (Xcode è quasi sempre in inglese anche su Mac italiani).

---

## PREREQUISITI (controlla prima di iniziare)
- Un **Mac** con **Xcode** installato e aggiornato (App Store → Xcode).
- Account **Apple Developer** a pagamento (99$/anno) già attivo.
- Il tuo **iPhone** + cavo (per provare i widget sul telefono).
- Gli **screenshot** che ti ho mandato in chat salvati sul Mac (IT, EN, slide verde).
- Aver già fatto in App Store Connect: **Agreements, Tax and Banking** (contratto
  app a pagamento + dati fiscali/bancari) — servono per l'abbonamento.

---

## PARTE 1 — Aggiornare il codice del progetto

1. Apri **Terminale** (Spotlight: `⌘ + Spazio`, scrivi "Terminale").
2. Vai nella cartella del progetto. Esempio (sostituisci col tuo percorso):
   ```
   cd ~/Documents/vita
   ```
   Se non sai il percorso: scrivi `cd ` (con lo spazio), poi **trascina la
   cartella del progetto** dentro il Terminale e premi Invio.
3. Scarica le ultime modifiche dal branch:
   ```
   git fetch origin
   git reset --hard origin/claude/vyta-candy-ui-restyle-hdzg0g
   ```
   ⚠️ Usa **`git reset --hard`**, NON `git pull` (il pull si blocca sul file
   del progetto iOS). Vedrai "HEAD is now at 0a71b3d …".
4. Installa eventuali dipendenze nuove:
   ```
   npm install
   ```
5. Compila l'app web:
   ```
   npm run build
   ```
   Deve finire con "✓ built in …". Se dà errore, fermati e mandami il messaggio.
6. Copia il web dentro il progetto iOS:
   ```
   npx cap sync ios
   ```
   Finisce con "Sync finished".
7. Apri il progetto in Xcode:
   ```
   npx cap open ios
   ```
   Si apre Xcode con il progetto **App** (file `App.xcworkspace`).

---

## PARTE 2 — Firma dell'app (Signing)

8. In Xcode, a sinistra (Project Navigator) clicca l'icona blu in cima: **App**.
9. Al centro, sotto **TARGETS**, seleziona **App**.
10. In alto, scheda **Signing & Capabilities**.
11. Spunta **Automatically manage signing**.
12. Alla voce **Team**, scegli il tuo team Apple Developer dal menu a tendina.
    - Se non compare: menu **Xcode → Settings → Accounts → +** e accedi con
      l'Apple ID dello sviluppatore, poi torna qui.
13. Controlla che **Bundle Identifier** sia `app.vita.lifeos`.
14. Non toccare il numero **Build** (è già **33** nel codice).

---

## PARTE 3 — App Group sull'app (contenitore condiviso per i widget)

> L'App Group è la "scatola condivisa" dove l'app scrive acqua/promemoria e il
> widget li legge. Va messa **uguale** su app e widget.

15. Sempre in **App → Signing & Capabilities**, clicca **+ Capability** (in alto
    a sinistra della scheda).
16. Nella finestra cerca **App Groups** e fai doppio clic per aggiungerlo.
17. Nel riquadro **App Groups** appena comparso, clicca il **+** piccolo.
18. Scrivi **esattamente**:
    ```
    group.app.vita.lifeos
    ```
    e premi Invio. Assicurati che la **casella accanto sia spuntata ✓**.

---

## PARTE 4 — Creare il target del Widget

19. Menu **File → New → Target…**
20. In alto seleziona **iOS**. Cerca/scegli **Widget Extension**. Clicca **Next**.
21. Compila:
    - **Product Name**: `VytaWidgets`
    - **Team**: il tuo (lo stesso dell'app)
    - **Include Live Activity**: **NON** spuntato (lascialo vuoto)
    - **Include Configuration App Intent**: se c'è, **NON** spuntarlo
      (useremo il nostro file).
22. Clicca **Finish**.
23. Compare un avviso "**Activate "VytaWidgets" scheme?**" → clicca **Activate**.

Ora a sinistra trovi una nuova cartella gialla **VytaWidgets**.

---

## PARTE 5 — Sostituire i file d'esempio col nostro

> Xcode ha creato dei file Swift di esempio. Vanno **eliminati** (altrimenti ci
> sono due `@main` e non compila), poi aggiungiamo il nostro unico file.

24. Apri la cartella **VytaWidgets** a sinistra. Vedrai dei file `.swift`
    (es. `VytaWidgets.swift`, magari `VytaWidgetsBundle.swift`, `AppIntent.swift`).
25. Seleziona **TUTTI i file `.swift`** dentro VytaWidgets (clic + ⌘‑clic), poi
    tasto destro → **Delete** → **Move to Trash**.
    - ✅ MANTIENI invece: **Assets.xcassets** e **Info.plist** (non eliminarli).
26. Aggiungi il nostro file: menu **File → Add Files to "App"…**
27. Naviga nella cartella del progetto → `ios` → `widget` → seleziona
    **`VytaWidgets.swift`**.
28. In basso nella finestra, alla voce **Add to targets**, spunta **SOLO
    `VytaWidgets`** (NON "App"). Poi **Add**.
29. Verifica: clicca `VytaWidgets.swift`, apri a destra il **File Inspector**
    (`⌥⌘1`); sotto **Target Membership** deve essere spuntato solo **VytaWidgets**.

---

## PARTE 6 — App Group + impostazioni sul target Widget

30. A sinistra seleziona il progetto **App** → sotto **TARGETS** scegli
    **VytaWidgets** → scheda **Signing & Capabilities**.
31. **Team**: imposta il tuo (uguale all'app).
32. Clicca **+ Capability** → aggiungi **App Groups**.
33. Nel riquadro App Groups del widget, **spunta** `group.app.vita.lifeos`
    (lo stesso identico dell'app). Se non c'è, clicca **+** e riscrivilo uguale.
34. **Importante — versione minima iOS**: vai nella scheda **General** del target
    **VytaWidgets** → sezione **Minimum Deployments** → imposta **iOS 17.0**
    (i widget configurabili e i pulsanti interattivi richiedono iOS 17).

---

## PARTE 7 — Provare i widget sul telefono

35. Collega l'**iPhone** al Mac col cavo. Sbloccalo e, se chiede, tocca
    **Autorizza** questo computer.
36. In alto in Xcode, accanto al pulsante ▶︎, scegli come destinazione il **tuo
    iPhone** (non il simulatore — i widget interattivi si provano meglio sul
    device).
37. Seleziona lo schema **App** (accanto alla destinazione, deve esserci "App").
38. Premi ▶︎ (**Run**). La prima volta:
    - Sull'iPhone: **Impostazioni → Generali → VPN e gestione dispositivo** →
      tocca il tuo profilo sviluppatore → **Autorizza**.
    - Su Mac potrebbe chiedere la password del portachiavi: consenti.
39. L'app si apre sul telefono. **Apri la Home dell'app una volta** (così scrive
    i dati per i widget).
40. Aggiungi i widget:
    - Vai alla **schermata Home** dell'iPhone, tieni premuto su uno spazio vuoto
      finché le icone tremano → tocca **+** in alto a sinistra → cerca **Vyta**.
    - Scegli **Acqua** o **Lista**, scorri per la **dimensione** (piccolo/medio/
      grande), **Aggiungi widget**.
    - Per la **lista**: dopo averla messa, tienila premuta → **Modifica widget**
      → scegli **Oggi / Settimana / To‑Do**.
    - **Lock Screen**: blocca il telefono, tieni premuto sullo sfondo →
      **Personalizza** → **Schermata di blocco** → tocca l'area widget →
      aggiungi **Vyta**.
41. Tocca **+ Bicchiere** sul widget Acqua: riapri l'app → l'acqua si aggiorna
    (il widget scrive, l'app applica all'apertura).

> Se i widget mostrano **0 / vuoti**: l'App Group non è identico, oppure non hai
> aperto l'app dopo l'installazione. Ricontrolla i passi 18 e 33.

---

## PARTE 8 — Creare l'Archivio per l'App Store

42. In alto, cambia la destinazione da "iPhone" a **Any iOS Device (arm64)**
    (in cima alla lista destinazioni). Lo schema deve restare **App**.
43. Menu **Product → Clean Build Folder** (`⇧⌘K`).
44. Menu **Product → Archive**.
    - Parte la compilazione (qualche minuto). Se dà errori di firma, vedi
      "Problemi" sotto.
45. A fine archiviazione si apre la finestra **Organizer** con il tuo archivio.

---

## PARTE 9 — Caricare su App Store Connect

46. Nell'Organizer, con l'archivio selezionato, clicca **Distribute App**.
47. Scegli **App Store Connect** → **Next** → **Upload** → **Next**.
48. Lascia le opzioni di default (Upload symbols, Manage signing automatically)
    → **Next** → **Upload**.
49. Attendi "Upload successful". Il build **33** ora è in elaborazione su App
    Store Connect (15–60 minuti). Puoi chiudere Xcode.

---

## PARTE 10 — App Store Connect (dal browser)

50. Vai su **appstoreconnect.apple.com** → **App** → **Vyta**.
51. Apri la versione **1.2** (a sinistra, sotto la piattaforma iOS). Se non c'è
    o è già pubblicata, clicca **(+) Version or Platform** e crea **1.2**.
52. **Build**: scorri fino alla sezione *Build* → clicca **(+)** o **Add Build**
    → seleziona il **build 33** (quando ha finito di elaborare; se non lo vedi,
    aspetta e ricarica).
53. **Screenshot**: sezione *App Previews and Screenshots* → seleziona la
    dimensione **iPhone 6.9"** → trascina le slide **inglesi** nella
    localizzazione **English** e le **italiane** nella localizzazione
    **Italiano** (in alto puoi cambiare lingua). Bastano 3–5 per lingua, max 10.
54. **Novità di questa versione** (*What's New*): incolla il testo IT nella
    localizzazione italiana e quello EN nell'inglese (li trovi in `RELEASE.md`).
55. Controlla che **prezzo/abbonamento**, descrizione, parole chiave, categoria,
    URL privacy siano a posto.
56. Clicca **Add for Review** (o **Save** poi **Submit for Review**).
57. Rispondi alle domande finali:
    - **Export Compliance / crittografia**: l'app usa solo HTTPS standard →
      seleziona che sei **esente** (rispondi "No" a crittografia non standard).
    - **IDFA / Advertising**: l'app non fa tracking pubblicitario → **No**.
    - Se compare il banner **Agreements, Tax, and Banking** → completalo.
58. **Submit**. Lo stato passa a **Waiting for Review** → **In Review** → di
    solito esito in 24–48h via email.

---

## PROBLEMI COMUNI E SOLUZIONI

- **"Signing requires a development team"** → hai saltato il Team su un target.
  Rifai i passi 12 (app) e 31 (widget).
- **Due `@main` / "duplicate symbol"** in compilazione → non hai eliminato tutti
  i file `.swift` d'esempio nella cartella VytaWidgets (passo 25).
- **Errore "AppIntentConfiguration is only available in iOS 17"** → imposta la
  Minimum Deployment del target VytaWidgets a **iOS 17.0** (passo 34).
- **Widget mostra zeri/vuoto** → App Group diverso tra app e widget, o app non
  aperta dopo l'install (passi 18, 33, 39).
- **Il build 33 non appare in App Store Connect** → è ancora "in elaborazione",
  aspetta qualche minuto e ricarica la pagina.
- **Revisione precedente ancora "In Review"** → rimuovi quel build dalla
  revisione, poi seleziona il 33 e reinvia.

---

## RIEPILOGO CHIAVI
- Branch: `claude/vyta-candy-ui-restyle-hdzg0g`
- Versione **1.2** · Build **33**
- App Group (identico su 2 target): `group.app.vita.lifeos`
- Bundle ID app: `app.vita.lifeos` · Widget: `app.vita.lifeos.VytaWidgets`
- Comando aggiornamento: `git reset --hard origin/<branch>` (mai `git pull`)
- Min iOS del widget: **17.0**
