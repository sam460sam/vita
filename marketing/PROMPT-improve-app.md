# Prompt — Vyta: studio di mercato + miglioramento app + conversione ad abbonamento

> Copia tutto il blocco qui sotto (da "## CONTESTO" in giù) e incollalo in una
> nuova sessione di Claude Code sul repo `sam460sam/vita`.

---

## CONTESTO

Lavori su **Vyta — Life OS** (repo `sam460sam/vita`), un "life OS" personale già
pubblicato su App Store: <https://apps.apple.com/it/app/vyta-life-os/id6776238780>

- Il nome si **scrive "Vyta"** ma si **pronuncia "Vita"** all'italiana (VEE-ta).
  Nel codice il progetto si chiama ancora `vita`.
- Stack: React 18 + TypeScript + Vite, Tailwind (design token come CSS
  variables), **Dexie/IndexedDB** dietro `src/data/repo.ts`, React Router
  (HashRouter), PWA (`vite-plugin-pwa`) + **Capacitor** per iOS/Android.
- Moduli: oggi, attività (3 anelli stile Apple Watch), abitudini (streak +
  heatmap), progetti (kanban), diario/umore, obiettivi, finanze (budget +
  Sankey), calendario, peso, acqua, digiuno, gamification/premi, recap,
  personalizzazione (home a widget), onboarding, backup.
- Il differenziatore: **Momentum**, punteggio cross-life 0–100 che unisce tutti i
  moduli (`src/features/oggi/momentum.ts`), + **Stella**, la mascotte panda che
  reagisce al punteggio. Nessuna app mono-tema può replicarlo.
- Tutti i dati sono **solo sul dispositivo** (offline-first, privacy totale).

**Leggi PRIMA questi file e non duplicare ciò che già contengono:**
`GROWTH.md` (posizionamento, pricing 3 €/mese – 30 €/anno, playbook marketing,
5 pilastri), `store/LISTING.md`, `store/PUBLISH.md`, `store/PRIVACY.md`,
`README.md`, `MOBILE.md`.

**Stato reale della monetizzazione (verificato — è il collo di bottiglia):**
- `src/premium/premium.tsx` ha `UNLOCK_ALL_FOR_NOW = true` e `can()` ritorna
  sempre `true` → **nessuna feature è realmente gated, nessuno può pagare**.
- `src/features/pro/ProPage.tsx` (84 righe): il CTA principale fa solo
  `toast.show(t('pro.soon'))` → "prossimamente". Nessun acquisto reale.
- Nessuna dipendenza di billing in `package.json` (no RevenueCat, no StoreKit).
- L'onboarding (`src/features/onboarding/Onboarding.tsx`) ha 8 step
  (`lang → welcome1 → intro → focus → modules → habits → name → aha`):
  **nessuno step di trial e nessun paywall**.

## OBIETTIVO

Migliorare Vyta su tre assi, con lavoro reale sul codice e non solo documenti:

1. **Studio di mercato** basato su fonti vere, con accesso pieno a internet.
2. **Audit di conversione**: valutare come l'app è disposta oggi per portare
   l'utente a usarla, attivarsi, iniziare il trial e pagare l'abbonamento.
3. **Implementazione**: funnel di monetizzazione, attivazione e retention +
   asset visivi migliori per lo Store, generati con Higgsfield.

## FASE 0 — Guardrail (fallo prima di tutto)

- Crea e lavora su un branch nuovo (`claude/market-study-monetization`), commit
  atomici e messaggi descrittivi. Non toccare `main` direttamente.
- `npm install && npm run build` deve passare **a ogni commit** (`tsc -b`
  incluso). Se rompi il build, lo aggiusti prima di andare avanti.
- **Budget Higgsfield**: chiama `balance` come prima cosa. Il credito è basso
  (~15 crediti). Le immagini `soul_2` costano ~1 credito, i **video costano
  135+ crediti a clip**: non generare NESSUN video e non spendere più di 10
  crediti totali senza chiedermelo prima. Usa `get_cost` in preflight quando
  disponibile. Compositing, crop, testi e montaggio si fanno con ffmpeg/Pillow
  nella sandbox: costano zero.
- **Onestà obbligatoria** in tutto ciò che produci: nessun numero inventato.
  Ogni dato di mercato deve avere la fonte con URL e data. Se un dato non lo
  trovi, scrivi "non verificato" invece di stimarlo a caso.

## FASE 1 — Studio di mercato (usa WebSearch + WebFetch a fondo)

Produci `marketing/MARKET-STUDY.md` con fonti citate:

1. **Teardown competitor** (almeno 8, includi: Finch, Habitica, Streaks, Way of
   Life, Notion, Sunsama, Reflectly, Daylio, Bearable, Cal AI, Fabulous,
   Structured, Apple Health/Fitness). Per ognuno: posizionamento in una frase,
   modello di pricing esatto (prezzi reali, trial, weekly/monthly/annual),
   dov'è il paywall nel funnel, cosa fa la loro pagina Pro, punti di forza e
   debolezze, review negative ricorrenti (leggi le recensioni 1–3 stelle su App
   Store/Reddit: sono la miniera d'oro delle opportunità).
2. **Benchmark di settore verificati**: retention D1/D7/D30 tipica per app di
   produttività/benessere, conversione free→paid tipica, conversione
   trial→paid, prezzi mediani 2026. Cita le fonti (RevenueCat State of
   Subscription Apps, Adjust, Sensor Tower, business of apps…).
3. **ASO**: ricerca keyword reali per il nostro caso. **Valuta criticamente il
   nome "Vyta"**: si pronuncia "Vita" ma si scrive con la y — quantifica il
   rischio di ricercabilità (chi sente lo spot cerca "Vita" e non ci trova) e
   proponi rimedi concreti (sottotitolo, keyword field, "Vyta (Vita)" nel
   titolo, campagne su brand-name). Analizza le keyword dei competitor.
4. **Posizionamento**: dove Vyta vince davvero (Momentum cross-life + privacy
   offline + all-in-one), e i 3 segmenti di utenti su cui puntare, con il
   messaggio per ciascuno.
5. **Prezzo**: conferma o smentisci con dati i 3 €/mese – 30 €/anno di
   GROWTH.md. Considera un tier lifetime e il pricing per l'Italia vs USA.
   Motiva ogni numero.

## FASE 2 — Audit di conversione dell'app attuale

Naviga davvero l'app (`npm run build && npm run preview`, Chromium/Playwright è
già installato: `PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers`, non scaricare
browser) e **guarda gli screenshot** che produci, schermata per schermata, a
390×844. Puoi popolare dati demo realistici da `src/data/seed.ts` o scrivendo
direttamente in IndexedDB.

Produci `marketing/CONVERSION-AUDIT.md` che risponde, con evidenze visive:

- **Time-to-value**: quanti secondi e quanti tap dal primo avvio al primo
  momento "wow"? L'onboarding a 8 step aiuta o è attrito?
- **Attivazione**: cos'è il nostro "aha moment" misurabile? Quale azione al
  primo giorno correla con l'utente che resta (es. prima abitudine segnata,
  primo Momentum > 30)? Oggi l'app la incoraggia o la lascia al caso?
- **Percezione del valore**: un nuovo utente capisce che c'è dentro una vita
  intera, o vede una dashboard vuota? Valuta lo stato vuoto di ogni modulo.
- **Paywall**: dov'è oggi (da nessuna parte), dove dovrebbe essere, e perché.
  Come si arriva alla pagina Pro? Quanti utenti la vedrebbero mai?
- **Retention loop**: promemoria serale, Recap condivisibile, streak, premi —
  funzionano davvero o sono presenti ma invisibili?
- **Frizioni e bug** che uccidono la conversione (schermate rotte, testi
  tagliati, tap target piccoli, stati di caricamento, dark mode).
- Chiudi con una **lista prioritizzata** (impatto × sforzo) di interventi.

## FASE 3 — Implementazione (la parte che conta)

Implementa, in commit separati e con il build verde:

1. **Gating reale dietro un'astrazione pulita.** Sostituisci
   `UNLOCK_ALL_FOR_NOW` con un vero stato di entitlement in `premium.tsx`,
   mantenendo l'API (`isPremium`, `can(feature)`) invariata per il resto
   dell'app. Aggiungi uno stato `trial` con scadenza persistita, e granularità
   per-feature vera (finanze / obiettivi avanzati / calendario / statistiche).
2. **Paywall e pagina Pro degni del prezzo.** Riscrivi `ProPage.tsx`: valore
   prima del prezzo, confronto Free vs Pro leggibile, prezzo annuale come
   default con risparmio evidenziato, prova sociale se disponibile, FAQ su
   privacy e cancellazione. Aggiungi un componente paywall riusabile che si
   apre quando si tocca una feature Pro, con il contesto della feature (non un
   muro generico).
3. **Trial di 7 giorni** integrato nell'onboarding come step opzionale dopo
   l'"aha", + banner non invasivo di giorni rimanenti, + schermata di fine
   trial che spiega cosa si perde.
4. **Attivazione**: migliora gli stati vuoti in azioni concrete, aggiungi (se
   ha senso) un "primo giorno guidato" che porta l'utente a un Momentum
   significativo entro 5 minuti.
5. **Analytics locali e privacy-safe**: un layer di eventi (`src/lib/analytics`)
   con eventi chiave del funnel (onboarding completato, prima abitudine,
   paywall visto, trial iniziato, acquisto tentato), salvati **solo in locale**
   e ispezionabili in Impostazioni. Nessuna telemetria di rete senza mio
   consenso esplicito: la privacy offline è il nostro argomento di vendita,
   non tradirla.
6. **Etica e conformità (vincolante)**: nessun dark pattern — niente finti
   countdown, niente prezzi ingannevoli, niente pulsante di chiusura nascosto,
   cancellazione sempre chiara. Le linee guida App Store 3.1.2 puniscono la UI
   ingannevole sugli abbonamenti: rispettale.
7. **Limite tecnico da rispettare**: i pagamenti reali su iOS/Android
   richiedono i prodotti creati su App Store Connect e un account RevenueCat
   con le sue API key — **cose che io devo fare a mano**. Costruisci tutto fino
   a quel confine, dietro un'interfaccia `BillingProvider` con
   un'implementazione mock funzionante e testabile, e scrivi in
   `docs/BILLING-SETUP.md` la checklist esatta dei passi manuali che restano a
   me (prodotti, prezzi, RevenueCat, entitlement, testing sandbox). **Non
   inventare chiavi e non fingere che i pagamenti funzionino.**

## FASE 4 — Asset visivi per lo Store (Higgsfield, budget rigido)

- Rigenera gli screenshot App Store da app reale (non mockup finti), 6 schermate
  che raccontano una storia, in `store/screenshots/`. Cattura sia light sia dark
  mode. Ci sono già catture pronte in `marketing/captures/` e
  `marketing/captures/dark/`: riusale se vanno bene.
- Per le cornici, i titoli e gli sfondi usa ffmpeg/Pillow nella sandbox (costo
  zero). Usa Higgsfield **solo** dove serve davvero un'immagine generata
  (sfondi/lifestyle, icona, artwork di Stella): `soul_2` per le immagini,
  `upscale_image`/`remove_background`/`outpaint_image` per gli edit — sempre
  entro il budget della Fase 0.
- Aggiorna `store/LISTING.md` con titolo, sottotitolo, keyword e descrizione
  ottimizzati secondo la ricerca ASO della Fase 1, in italiano e inglese.

## FASE 5 — Misurazione e chiusura

- `marketing/ROADMAP.md`: cosa fare nelle prossime 4 settimane, in ordine, con
  la metrica che ogni intervento deve muovere e il valore atteso motivato.
- Riepilogo finale in chat: cosa hai cambiato, cosa hai scoperto di
  controintuitivo nella ricerca, cosa resta a me da fare a mano, e cosa NON hai
  fatto e perché.
- Pusha il branch. **Non aprire una pull request** se non te lo chiedo.

## COME LAVORARE

- Usa al massimo le tue capacità: ragiona a fondo prima di scrivere codice,
  parallelizza le ricerche web e le letture di file quando sono indipendenti,
  e verifica visivamente ogni schermata che modifichi invece di assumere.
- Rispetta lo stile del codebase: **nessuna logica di business nei componenti
  UI** (vive in `src/data/repo.ts` e nei `logic.ts` di ogni feature), storage
  dietro i repository, API di piattaforma dietro `src/platform/platform.ts`,
  design token come CSS variables, i18n con `useT()`/`useI18n()` per **entrambe**
  le lingue (it + en) — mai stringhe hardcoded.
- Se una mia richiesta è tecnicamente sbagliata o dannosa per l'utente finale,
  dimmelo in due righe e proponi l'alternativa migliore, poi procedi.
- Non chiedermi conferma per ogni passo: procedi in autonomia e fermati solo
  sulle decisioni che cambiano davvero il prodotto (prezzo finale, nome,
  spesa di crediti, qualsiasi invio di dati fuori dal dispositivo).
