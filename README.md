# Vita — Life OS

Un **all-in-one life OS** personale: un unico hub per salute & attività,
progetti, abitudini, diario e obiettivi. Bianco, serio, professionale.
**Mobile-first, offline-first, installabile (PWA)** e già **Capacitor-ready**
per le future app native iOS/Android.

## Stack

- **React 18 + TypeScript + Vite**
- **Tailwind CSS** con design token come CSS variables (`src/styles/index.css`)
- **Dexie** (IndexedDB) dietro un layer dati tipizzato
- **React Router** (`HashRouter`, deep-link safe)
- **lucide-react** (icone) · **date-fns** (date) · grafici in **SVG nativo**
- **vite-plugin-pwa** (manifest, service worker, offline)

## Comandi

```bash
npm install      # installa le dipendenze
npm run dev      # sviluppo (http://localhost:5173)
npm run build    # type-check + build di produzione in dist/
npm run preview  # serve la build di produzione
npm run lint     # type-check (tsc --noEmit)
```

Le icone PWA sono generate da `node scripts/gen-icons.mjs` (one-off, senza dipendenze).

## Architettura

```
src/
  app/        Shell: router, sidebar/tab bar, header, quick-add (FAB), layout
  ui/         Design system: Card, Button, ListRow, Pill, Sheet, ProgressRing,
              ActivityRings, Segmented, Checkbox, BarChart, Toast, campi form…
  data/       types.ts (modello dati) · db.ts (Dexie) · repo.ts (API dati) ·
              defaults.ts (settings)
  platform/   platform.ts — wrapper su file/share/haptics (Capacitor-ready)
  lib/        format.ts (date/numeri/valuta), cn.ts
  features/   un modulo per cartella, con logica + componenti + form:
              oggi · attivita · progetti · abitudini · diario ·
              obiettivi · finanze · calendario · altro · impostazioni
  styles/     token + base CSS
```

Regola chiave: **nessuna logica di business nei componenti UI** — vive in
`data/repo.ts` e nei `logic.ts` di ogni feature. Lo storage è astratto dietro
i repository, le API di piattaforma dietro `platform.ts`.

## Moduli

1. **Oggi** — dashboard: anelli attività, "Da fare oggi", prossimi impegni, quick stats.
2. **Attività** — 3 anelli stile Apple Watch, catalogo sport ricercabile,
   tracking con timer, storico e riepilogo settimana/mese.
3. **Progetti & Task** — progetti con % avanzamento, task con priorità/scadenza/
   sottotask, viste lista e **kanban** (drag & drop), Inbox e viste rapide.
4. **Abitudini** — check giornaliero, streak/record, heatmap, % completamento,
   frequenza configurabile.
5. **Diario & Umore** — voce giornaliera con umore + tag, calendario dei mood, ricerca.
6. **Obiettivi** — collegabili a progetti/abitudini per progresso automatico.
7. **Finanze** — entrate/uscite, budget mensile, spese per categoria.
8. **Calendario** — vista unificata mese/settimana (task, allenamenti, diario).

## Dati & backup

Tutto è salvato **solo sul dispositivo** (IndexedDB). In
**Impostazioni** puoi **esportare/importare** l'intero stato in JSON per il
backup. I moduli aggiuntivi sono attivabili/disattivabili.

## App native

Vedi **[MOBILE.md](./MOBILE.md)** per i passi futuri con Capacitor.
