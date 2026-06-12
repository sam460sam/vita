# Vyta — Rilascio 1.2 (build 36)

Branch: `claude/vyta-candy-ui-restyle-hdzg0g` · Versione **1.2** · Build **36**
Tutto committato e pushato. Questa release arriva **fino ai widget**; il resto
(allenamento nativo + Apple Watch) va alla **prossima versione**.

---

## ✅ Cosa c'è in questa build (lavoro fatto)
- Redesign completo "Caldo & soft" (palette verde, tema chiaro/scuro)
- Nuovo **logo a foglia "V"** + **splash animato** V → Vyta
- Nuovo modulo **Note con checklist**
- **Home** ridisegnata: saluto, settimana, momentum, "La tua giornata", Esplora
- **Abitudini** ridisegnate (statistiche, heatmap colorata, giorni settimana, Check in)
- **Acqua**: nuova schermata "tracking" (gocce, promemoria con intervallo, obiettivo con medie)
- **Promemoria intelligenti** (avviso serale solo se rischi di perdere lo streak)
- **Apple Salute**: import allenamenti, passi, calorie → anelli + card Passi
- **Localizzazione completa IT/EN** (UI, date, dati demo)
- **3 famiglie di widget** Home + Lock Screen (Piccolo · Medio · Grande), bilingui:
  - **Acqua** — gocce interattive (tocca una goccia vuota = +1 bicchiere) + 1 L
  - **Lista** configurabile — Oggi · Settimana · To‑Do
  - **Abitudini** — heatmap (piccolo) e tracker settimanale (medio/grande)

## 📝 Novità di questa versione (App Store)

**Italiano**
```
Vyta si rinnova completamente! 🌱
• Nuovo look caldo e luminoso con il nuovo logo a foglia
• Splash animato all'avvio
• Note con checklist
• Abitudini ridisegnate con heatmap e check-in
• Nuova schermata Acqua con promemoria e obiettivi
• Promemoria intelligenti: ti avvisiamo solo se rischi di perdere lo streak
• Widget per Home e blocco schermo: acqua, lista (oggi/settimana/to-do) e abitudini
• Connessione ad Apple Salute per allenamenti, anelli e passi
• Tante rifiniture grafiche e miglioramenti di stabilità
```

**English**
```
Vyta gets a full refresh! 🌱
• Warm, brighter new design with our new leaf logo
• Animated launch splash
• Notes with checklists
• Redesigned Habits with heatmaps and check-in
• New Water screen with reminders and goals
• Smart reminders: we only nudge you if your streak is at risk
• Home & Lock Screen widgets: water, list (today/week/to-do) and habits
• Apple Health connection for workouts, rings and steps
• Lots of visual polish and stability improvements
```

## 🖼️ Screenshot (App Store, 1290×2796 / 6.9")
Già generati e **inviati in chat** (salvali dal telefono):
- 5 slide **IT** + 5 slide **EN** (Home, Abitudini/Habits, Note/Notes, Salute/Health, Momentum)
- 1 slide **"Funzionalità / Features"** con sfondo verde (IT + EN)

---

Per i passaggi dettagliati con verifiche, vedi **GUIDA.md**.

## 🔑 Chiavi
- Branch `claude/vyta-candy-ui-restyle-hdzg0g` · **1.2 / build 36**
- App Group (su entrambi i target): `group.app.vita.lifeos`
- Bundle: app `app.vita.lifeos` · widget `app.vita.lifeos.VytaWidgets`
- Aggiorna con `git reset --hard origin/<branch>` (mai `git pull`)
- Min iOS del widget: **17.0**

## 🔜 Prossima versione
- To‑do spuntabili dal widget
- Allenamento **nativo** (HKWorkoutSession) + **app Apple Watch**
