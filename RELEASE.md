# Vyta — Rilascio 1.2 (build 33)

Branch: `claude/vyta-candy-ui-restyle-hdzg0g` · Versione **1.2** · Build **33**
Tutto committato e pushato. Questa release arriva **fino ai widget**; il resto
(allenamento nativo + Apple Watch) va alla **prossima versione**.

---

## ✅ Cosa c'è in questa build (lavoro fatto)
- Redesign completo "Caldo & soft" (palette verde, tema chiaro/scuro)
- Nuovo **logo a foglia "V"** + **splash animato** V → Vyta
- Nuovo modulo **Note con checklist**
- **Home** ridisegnata: saluto, settimana, momentum, "La tua giornata", Esplora
- **Promemoria intelligenti** (avviso serale solo se rischi di perdere lo streak)
- **Apple Salute**: import allenamenti, passi, calorie → anelli + card Passi
- **Localizzazione completa IT/EN** (UI, date, dati demo)
- **Widget** Home + Lock Screen: Acqua (+ Bicchiere / + 1 L) e Lista
  configurabile (Oggi · Settimana · To‑Do). Bilingue, 3 dimensioni.

## 📝 Novità di questa versione (App Store)

**Italiano**
```
Vyta si rinnova completamente! 🌱
• Nuovo look caldo e luminoso con il nuovo logo a foglia
• Splash animato all'avvio
• Nuova sezione Note con checklist
• Home ridisegnata: la tua giornata, abitudini e momentum a colpo d'occhio
• Promemoria intelligenti: ti avvisiamo la sera solo se rischi di perdere lo streak
• Widget per Home e schermata di blocco: acqua e promemoria
• Connessione ad Apple Salute per allenamenti, anelli attività e passi
• Tante rifiniture grafiche e miglioramenti di stabilità
```

**English**
```
Vyta gets a full refresh! 🌱
• Warm, brighter new design with our new leaf logo
• Animated launch splash
• New Notes section with checklists
• Redesigned Home: your day, habits and momentum at a glance
• Smart reminders: we only nudge you in the evening if your streak is at risk
• Home & Lock Screen widgets: water and reminders
• Apple Health connection for workouts, activity rings and steps
• Lots of visual polish and stability improvements
```

## 🖼️ Screenshot (App Store, 1290×2796 / 6.9")
Già generati e **inviati in chat** (salvali dal telefono):
- 5 slide **IT** + 5 slide **EN** (Home, Abitudini/Habits, Note/Notes, Salute/Health, Momentum)
- 1 slide **"Funzionalità / Features"** con sfondo verde (IT + EN)

---

# 🖥️ DA FARE A CASA (passo-passo)

### 1 · Aggiorna il codice
```
cd <cartella-progetto>
git fetch origin
git reset --hard origin/claude/vyta-candy-ui-restyle-hdzg0g   # NON git pull
npm install
npm run build
npx cap sync ios
npx cap open ios
```

### 2 · Firma
- Target **App** → **Signing & Capabilities** → seleziona il **Team**
- Build number = **33** (già nel repo, non toccarlo)

### 3 · Widget — App Group (una volta sola)
- Target **App** → **+ Capability → App Groups** → `group.app.vita.lifeos` (✓)

### 4 · Widget — crea il target
- **File → New → Target → Widget Extension** → nome **VytaWidgets**
  (togli "Include Live Activity") → Finish → **Activate**
- Elimina il file `.swift` d'esempio creato da Xcode
- **File → Add Files** → `ios/widget/VytaWidgets.swift` → spunta **solo** *VytaWidgets*
- Target **VytaWidgets** → **+ App Groups** → `group.app.vita.lifeos` (identico) + **Team**

### 5 · Prova sul telefono
- Schema **App** → Run sull'iPhone → apri la Home dell'app una volta
- Home iPhone: tieni premuto → **+** → cerca **Vyta** → aggiungi widget
- Lista: long‑press sul widget → **Modifica widget** → Oggi / Settimana / To‑Do
- Lock Screen: tieni premuto sul blocco → Personalizza → Aggiungi widget → Vyta

### 6 · Archivia e carica
- Destinazione **Any iOS Device (arm64)**
- **Product → Clean Build Folder** → **Product → Archive**
- **Distribute App → App Store Connect → Upload** → attendi elaborazione (~15–60 min)

### 7 · App Store Connect (browser)
- Versione **1.2** → **Build** → seleziona il **33**
- **Screenshot 6.9"**: carica le slide IT (localizzazione Italiano) e EN (English)
- **Novità di questa versione**: incolla i testi qui sopra (IT + EN)
- **Export Compliance** → esente (solo HTTPS) · **IDFA** → No
- Se appare il banner *Agreements, Tax, and Banking* → completalo
- **Aggiungi per la revisione → Invia**

---

## ⚠️ Promemoria importanti
- Usa sempre `git reset --hard origin/<branch>`, **mai** `git pull`
- L'App Group deve essere **identico** nei due target: `group.app.vita.lifeos`
- Se i widget mostrano zeri → App Group diverso, o app non aperta dopo l'install
- Dettagli widget in **`WIDGETS.md`**

## 🔜 Prossima versione (1.3 / 1.4)
- To‑do spuntabili dal widget
- Allenamento **nativo** (HKWorkoutSession) + **app Apple Watch**
- Eventuali widget aggiuntivi (es. Momentum)
