# Roadmap Vyta — funzioni dopo la 1.0

Documento di pianificazione per gli aggiornamenti successivi alla prima
pubblicazione. **Niente di qui è ancora implementato** (a parte dove indicato
"già presente"): serve a preparare il lavoro per quando la 1.0 sarà approvata e
live sull'App Store.

Principio guida: la 1.0 deve essere approvata **così com'è** (pulita, gratis,
"Data Not Collected"). Le novità qui sotto arrivano in **1.1** e **1.2**, per
non aumentare la superficie di rilievi durante una review.

---

## Stato attuale (contesto)

- App **Capacitor** (web in `dist/` impacchettato nel guscio iOS/Android).
- **Locale-first**: nessun account, nessun cloud obbligatorio, tutto sul
  dispositivo → privacy App Store dichiarata **"Data Not Collected"**.
- Home a **widget** già personalizzabile (vedi sezione A).
- Sezioni esistenti rilevanti: Diario & Umore (`src/features/diario`),
  Recap (`src/features/recap`), Onboarding (`src/features/onboarding`),
  Personalizzazione (`src/features/personalizzazione`).

---

## 1.1 — valore alto, **nessun** cambiamento di privacy

Tutte le funzioni di questa versione usano **solo dati già sul dispositivo**:
nessun permesso nuovo, nessuna modifica alla "App Privacy" su App Store Connect.
Al massimo si aggiornano screenshot e descrizione.

### A. Home personalizzata e a lunghezza variabile — *già in gran parte presente*

**Come funziona oggi** (`src/features/personalizzazione/defaultLayout.ts`):
`defaultWidgets(enabled)` costruisce la dashboard iniziale partendo dai
**moduli attivati** dall'utente. I widget "core" (momentum, acqua, azioni
rapide, todo, affermazione, premi) ci sono sempre; gli altri (attività,
abitudini, finanze, peso, diario, obiettivi) compaiono **solo se il relativo
modulo è acceso**. Quindi la home è già **più o meno lunga** a seconda di cosa
usa la persona.

**Cosa manca / da migliorare per la 1.1:**
1. **Onboarding che guida la personalizzazione**: durante l'onboarding chiedere
   esplicitamente "su cosa vuoi concentrarti?" (es. salute, soldi, studio,
   abitudini) e da lì **attivare i moduli giusti**, così `defaultWidgets`
   produce subito una home su misura. Oggi i moduli si attivano dopo, a mano.
2. **Modalità compatta (opzionale)**: un'opzione "tutto in una schermata" che
   usa widget `small` e nasconde i dettagli secondari, per chi non vuole
   scrollare. ⚠️ Limite fisico: su iPhone piccoli "tutto senza scroll" rende i
   riquadri minuscoli → meglio far **scegliere 4–6 widget fissi**, il resto a
   un tocco.
3. **Editor widget più visibile**: rendere ovvio che si possono
   aggiungere/rimuovere/riordinare i widget (la base c'è in
   `PersonalizationSection.tsx`).

**File coinvolti:** `defaultLayout.ts`, `modules.ts`, `prefs.ts`,
`PersonalizationSection.tsx`, `home/HomeDashboard.tsx`,
`home/widgets/registry.tsx`, `onboarding/Onboarding.tsx`.

### B. Test della personalità

Quiz iniziale (8–12 domande) che produce un **profilo motivazionale** (es.
"ti motivano le streak" / "meglio obiettivi piccoli e frequenti") e da lì:
- suggerisce **quali abitudini** attivare (collegandosi a
  `src/features/abitudini/recommended.ts`),
- imposta il **tono** dei messaggi/affermazioni e della home.

Tutto **in locale**. Da creare: una nuova feature `src/features/personalita`
(quiz + logica di mapping risposte → suggerimenti) e un passaggio opzionale
nell'onboarding.

### C. Recap settimanale stile "Wrapped"

Potenziare il Recap **già esistente** (`src/features/recap/RecapPage.tsx`,
`insights.ts`, `shareImage.ts`):
- "storie" a schermo intero con numeri d'effetto ("5 abitudini completate",
  "+20% acqua vs settimana scorsa"),
- grafica curata e **immagine condivisibile** (la generazione c'è già in
  `shareImage.ts`).

Usa solo dati locali. Lavoro soprattutto grafico.

### D. Note & Umore (note interne all'app)

Estendere la sezione **Diario & Umore** (`src/features/diario`) con **note
libere** dell'utente (oltre all'umore/journal già presenti). Restano
nell'app, sul dispositivo. Questo è il "collegamento note" fattibile subito,
**senza** dipendere dall'app Note di Apple.

**File coinvolti:** `diario/JournalPage.tsx`, `diario/JournalForm.tsx`,
`diario/mood.ts`, più eventuale nuovo tipo dato per le note.

---

## 1.2 — Import dall'app Note di Apple (Share Extension)

### Perché una Share Extension (e non un "collegamento" diretto)

Apple **non fornisce un'API pubblica per leggere/scrivere l'app Note**. Nessuna
app di terze parti può sincronizzarsi con Apple Notes. L'unico modo approvato è
una **Share Extension**: l'utente, dentro Note (o qualsiasi app), seleziona del
testo → **Condividi** → sceglie **"Vyta"** → il testo entra in Vyta (es. come
nota nella sezione Note & Umore). È **manuale e a senso unico**, ma pulito e
accettato da Apple.

> Se in futuro servisse una sync vera di task/promemoria, esiste invece
> **EventKit/Reminders** (i Promemoria hanno un'API ufficiale; le Note no).
> Richiederebbe il permesso `NSRemindersFullAccessUsageDescription`.

### Passi tecnici (in Xcode)

1. **File → New → Target → Share Extension** nel progetto `ios/App`.
2. Creare un **App Group** (es. `group.app.vita.lifeos`) e abilitarlo sia sul
   target App che sull'estensione (Signing & Capabilities → App Groups). Serve
   a passare il testo condiviso dall'estensione all'app.
3. Nell'estensione: leggere il testo/URL condiviso e scriverlo nello storage
   condiviso dell'App Group (es. un file/`UserDefaults` del gruppo).
4. Nell'app (lato web/Capacitor): all'avvio/ritorno in foreground, leggere lo
   storage condiviso e creare la nota in Note & Umore. Serve un piccolo
   **plugin Capacitor nativo** (o usare un plugin community) per leggere
   l'App Group da JS.
5. Definire il tipo di contenuto accettato nell'`Info.plist` dell'estensione
   (`NSExtensionActivationRule`: testo, URL).

### Cosa cambia su App Store Connect / privacy

| Aspetto | Cambia? |
|---|---|
| Permesso di sistema "Note" | **No** — non esiste (non c'è API) |
| Prompt all'utente | **No** per la Share Extension |
| "App Privacy" (Data Not Collected) | **Invariata** se i dati restano sul dispositivo |
| Configurazione Xcode | **Sì**: nuovo target estensione + App Group entitlement |
| Build da ricaricare | **Sì**: nuovo binario con l'estensione |

Nessun cambiamento di privacy dichiarata finché **niente esce dal telefono**.

---

## 1.2 (o 1.3) — Integrazione Apple Salute (HealthKit)

> Funzione desiderata. Va fatta **dopo** che la 1.0 è approvata: richiede una
> funzionalità Salute **reale e visibile**, altrimenti Apple rifiuta per la
> Guideline **2.5.1** (è esattamente il motivo del rifiuto del 5 giu 2026,
> quando il progetto dichiarava HealthKit senza usarlo). Le chiavi
> `NSHealthShareUsageDescription` / `NSHealthUpdateUsageDescription` vanno
> **rimesse solo quando la funzione esiste davvero**.

### Cosa serve (app / Xcode)
1. **Plugin Capacitor nativo** per HealthKit (plugin community o codice Swift
   custom) — i plugin attuali non lo includono.
2. Attivare la **capability HealthKit** in Xcode (rigenera `App.entitlements`).
3. Rimettere le chiavi `NSHealthShareUsageDescription` /
   `NSHealthUpdateUsageDescription` nel `Info.plist`.
4. **UI visibile**: schermata "Connetti Apple Salute" che mostra dati importati
   (passi, battiti, allenamenti) e/o esporta gli allenamenti in Salute. Questa
   parte è obbligatoria perché Apple deve "vedere" l'integrazione.

### Cosa cambia su App Store Connect / privacy
| Aspetto | Cambia? |
|---|---|
| **Privacy policy** (URL) | **Obbligatoria** |
| **App Privacy** | **Sì**: dichiarare dati "Health & Fitness" usati |
| Permesso/prompt all'utente | **Sì** (accesso a Salute) |
| Uso dei dati per pubblicità/vendita | **Vietato** dalle linee guida |
| Descrizione app | Deve **menzionare** l'integrazione Salute |
| Build da ricaricare | **Sì** |

---

## Riepilogo privacy / App Store Connect per feature

| Feature | Dati locali? | Permesso nuovo | App Privacy | Note |
|---|---|---|---|---|
| Home personalizzata | Sì | No | Invariata | Solo codice/UI |
| Test personalità | Sì | No | Invariata | Solo codice |
| Recap "Wrapped" | Sì | No | Invariata | Solo grafica |
| Note interne (Diario & Umore) | Sì | No | Invariata | Solo codice |
| Share Extension (import da Note) | Sì | No | Invariata | Serve target + App Group + nuovo build |
| Apple Salute (HealthKit) | Sì | **Sì** (accesso Salute) | **Da rivedere** (Health & Fitness + privacy policy) | Serve UI visibile + capability + nuovo build |
| (Eventuale) Reminders/EventKit | Sì | **Sì** (`NSRemindersFullAccessUsageDescription`) | Invariata se locale | Mostra prompt |
| (Eventuale) sync su server/cloud | **No** | Dipende | **Da rivedere** | Non previsto ora |

---

## Ordine consigliato

1. **1.0** — far approvare la versione attuale (in review).
2. **1.1** — Home personalizzata (rifinire) + Test personalità + Recap Wrapped
   + Note interne in Diario & Umore. *(zero impatto privacy)*
3. **1.2** — Share Extension per importare da Apple Notes. *(serve target +
   App Group + nuovo build; privacy invariata)*
4. **1.2 / 1.3** — Integrazione **Apple Salute (HealthKit)** come funzione
   completa e visibile. *(serve plugin nativo + capability + privacy policy +
   App Privacy aggiornata + nuovo build)*
