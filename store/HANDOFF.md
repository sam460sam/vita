# HANDOFF — Progetto Vyta (App Store screenshots & lancio)

> Documento di continuità. Riassume dove siamo con screenshot, testi ASO e
> lancio App Store. Aggiornare man mano che si avanza.

---

## CONTESTO PROGETTO
App **Vyta** (bundle `app.vita.lifeos`, App Store id 6776238780). Stack: Capacitor + React +
TypeScript + Vite + Tailwind + Dexie. **Offline-first**, niente account, niente cloud,
niente analytics/network. Tracker di abitudini/acqua/benessere con un companion: **Vio**,
un germoglio in vaso (con la "V" del logo Vyta sul vaso) che cresce col progresso.
Repo: `sam460sam/vita`.

Pagine hero dell'app: **Acqua, Abitudini, Test (personalità)** + Home ("Oggi" con
"Momentum" = un punteggio 0–100 + Vio). Resto dei moduli in "Di più" (attività, peso,
diario, note, obiettivi, finanze, calendario, recap, premi). Monetizzazione: Vyta Pro,
prova gratuita 3 giorni, €3,99/mese o €29,99/anno (StoreKit nativo).

## OBIETTIVO ATTUALE
Finire gli **screenshot marketing per l'App Store** (6.9", 1320×2868) in **italiano e
inglese**, stile premium tipo YAZIO, con **Vio** che compare. 5 slide per lingua.

## COME SI CREANO GLI SCREENSHOT
Generati con **Gemini**. Per ogni slide si allegano 2 immagini:
- **Image 1** = screenshot reale dell'app (catturati con Puppeteer dalla build)
- **Image 2** = un render 3D di **Vio** (3 espressioni in uso):
  - **Vio HAPPY** (braccia su, sorrisone) → Hero, Habits, Water
  - **Vio WAIT** (mani giunte, curioso) → Test
  - **Vio SLEEPY** (occhi chiusi, Zzz) → Privacy

Regole imparate (IMPORTANTISSIME):
- Formato **verticale 9:19.5, 1320×2868, full-bleed**.
- **Niente fettina/anteprima di un altro schermo sui bordi** (va detto nel prompt).
- **La lingua dello schermo dentro il telefono DEVE combaciare con la lingua della
  headline** (errore ricorrente di Gemini: headline EN + schermo IT). Nel prompt scrivere
  "keep the UI text exactly as in the attached image, do not translate".
- **Niente rating/recensioni finte e niente badge "App Store"/stelle** → vietato dalle
  linee guida Apple (2.3) e rischio rifiuto.
- Gemini aggiunge un **watermark a stella ✦ in basso a destra** → va rimosso.
- Le immagini escono a 704×1520 → vanno **upscalate a 1320×2868 + sharpen + colore**.
- Le rifiniture (upscale, rimozione watermark, rimozione fettina, rimozione badge finto)
  si fanno con uno script Python/PIL.

## STATO ATTUALE DEGLI SCREENSHOT
- 🇮🇹 **ITALIANO: 5/5 COMPLETO** ✅ (Hero, Abitudini, Acqua, Test, Privacy) — watermark
  rimosso, formato 1320×2868.
- 🇬🇧 **ENGLISH: 4/5** (Hero, Habits, Water, Test) ✅ — **manca SOLO la Privacy EN**.
- I 9 file finiti (puliti + upscalati) sono salvati in `store/screenshots-appstore/`
  (`01..05-IT-*`, `06..09-EN-*`). Slide scartate: recensioni a stelle (vietate Apple 2.3)
  e le versioni con lingua schermo/headline non combacianti.

## PAGAMENTI / PRO — STATO
- ⚠️ Nel codice il billing **non è implementato**: `src/premium/premium.tsx` ha
  `UNLOCK_ALL_FOR_NOW = true` (tutto sbloccato, nessun prodotto StoreKit collegato).
- Vyta può uscire **solo gratis** finché non si scrive il billing (RevenueCat o StoreKit).
- Guida computer completa (aggiornamento app + pagamenti) in
  `store/COMPUTER-AGGIORNAMENTO-E-PAGAMENTI.md`.

## UNICO STEP RIMASTO PER GLI SCREENSHOT
Generare la **EN Privacy**:
- Image 1 = screenshot Home in inglese ("en-oggi": Good morning / Momentum / Habits-Water-Test)
- Image 2 = Vio SLEEPY
- Prompt (già pronto):
```
App Store marketing screenshot, tall vertical portrait, exact 9:19.5, 1320x2868 px, full-bleed. Do NOT show any sliver, edge or preview of another screen on any side — the background fills cleanly to all four edges. Background: warm cream paper (#F4EFE5) blending into a fresh botanical green gradient toward the bottom, faint hand-drawn leaf line-art and a few tiny golden sparkles, subtle paper grain. Big editorial serif headline near the top (heavy weight, warm dark ink, gentle letterpress press into the paper), two lines: "Your data stays on your phone". A lighter supporting line under it: "No account. Fully offline." A realistic matte black iPhone 15 Pro, slight 3D tilt and soft long drop shadow, centered, showing EXACTLY the attached app screenshot (Image 1, which is in ENGLISH) — pixel-accurate, sharp and bright, keep the English UI text exactly as in the attached image, with the iOS status bar, do not redraw, translate or blur the UI. Add a glossy 3D padlock and a small shield motif floating near the top of the phone, soft and reassuring. The Vyta sprout mascot "Vio" (Image 2) — a glossy 3D plant in a terracotta pot with a green leaf "V", same cute proportions and colors as the attached render — rests calmly beside the phone with eyes closed (sleepy, peaceful), lit warm from upper-right with a soft contact shadow. Premium, Behance/Dribbble quality, ultra-detailed, 4k, no watermark, no rating badge, no stars. Output one tall vertical image 1320x2868, full-bleed, no side sliver, nothing cropped.
```
Dopo la generazione: rifinire a 1320×2868 + rimuovere watermark ✦.

## HEADLINE DI OGNI SLIDE (IT / EN)
1. Hero: "Costruisci la tua **vita migliore**" / "Build your **better life**"
2. Abitudini: "Coltiva abitudini che durano" / "Grow habits that last"
3. Acqua: "Raggiungi il tuo obiettivo, ogni giorno" / "Reach your goal, every day"
4. Test: "Scopri chi sei davvero" / "Discover who you really are"
5. Privacy: "I tuoi dati restano sul telefono" / "Your data stays on your phone"

## TESTI SCHEDA APP STORE (ASO) — pronti (versione Vio)
> NOTA: il file `store/LISTING.md` nel repo contiene ancora la vecchia copy
> "Stella / Vyta — Life OS". Va allineato a questi testi quando si decide di farlo.

### 🇮🇹
- Nome (≤30): `Vyta: Abitudini e Benessere`
- Sottotitolo (≤30): `Cresci ogni giorno con Vio`
- Promo (≤170): Conosci Vio, il germoglio che cresce con te. Abitudini, acqua e un test che ti somiglia — tutto offline, senza account. Inizia con calma. 🌱
- Keyword (≤100): `abitudini,acqua,benessere,routine,umore,test personalità,offline,promemoria,salute,mindfulness,streak`
### 🇬🇧
- Name (≤30): `Vyta: Habits & Self-Care`
- Subtitle (≤30): `Grow every day with Vio`
- Promo (≤170): Meet Vio, the little sprout that grows with you. Habits, water and a test that feels like you — all offline, no account. Start calmly. 🌱
- Keywords (≤100): `habits,water,wellbeing,routine,mood,personality test,offline,reminders,self-care,mindfulness,streak`

(Descrizioni lunghe IT/EN complete: da rigenerare attorno a Vio.)

## PROSSIMI STEP (TODO)
1. [ ] Generare **EN Privacy** (prompt sopra) → rifinire + togliere watermark. *(richiede Gemini, fuori da questo ambiente)*
2. [ ] Caricare i 2 set (IT 5 + EN 5) su **App Store Connect** nelle localizzazioni giuste. *(fuori da questo ambiente)*
3. [ ] Inserire i **testi ASO** (nome/sottotitolo/keyword/descrizione/promo) IT + EN.
4. [ ] (Opzionale) testo **"Novità di questa versione"** IT/EN.
5. [ ] (Dal Mac) **build Xcode** dell'app con le ultime modifiche UI/UX + i widget iOS
       (VytaWidgets.swift, da compilare in Xcode — non compilabile fuori dal Mac).

## NOTE TECNICHE UTILI
- Cattura screenshot app: build (`npm run build`) → server statico su `dist` + Puppeteer
  (viewport 390×844 @2x), localStorage `vita.lang` = `it`/`en`, seed dati demo dal
  pulsante in Impostazioni, attendere lo splash ~3.8s, rimuovere il div z-index 200.
- Rifinitura immagini: PIL — `resize((1320,2868), LANCZOS)` + `UnsharpMask(2.2,115,2)` +
  `Color(1.06)` + `Contrast(1.04)`. Watermark ✦: cercarlo in basso a destra (~x1150–1215,
  y2700–2760), coprirlo con una toppa di sfondo adiacente sfumata.
- Asset Vio: `public/vio/` (seme/germoglio/pianta/fioritura + vio-happy/sleepy/wait/
  welcome/bell/celebrate). Le 3 espressioni usate per lo store sono happy/wait/sleepy.

## COSA SI PUÒ FARE DA QUESTA CHAT (ambiente cloud)
Questo ambiente è un container cloud isolato: **niente Gemini, niente App Store Connect,
niente Mac/Xcode**. Da qui si lavora su **testo e codice nel repo**:
- testi ASO (LISTING.md), descrizioni lunghe, "What's New";
- script di cattura screenshot e rifinitura;
- modifiche UI/UX dell'app, fix, ecc.
Gli step manuali/esterni (generazione render, upload sullo Store, archive Xcode) restano
da fare sulla macchina dell'utente.

## RICHIESTA PER LA NUOVA CHAT
Riparti da qui: aiutami a (1) rifinire la EN Privacy quando la genero, (2) preparare il
caricamento su App Store Connect, (3) eventualmente il "What's New", e (4) quando sono al
Mac, la build Xcode. Tutti gli screenshot finali IT/EN li ho già scaricati.
