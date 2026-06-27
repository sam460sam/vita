# Build iOS — procedura passo-passo (per Samuele)

Da terminale, dall'inizio. Esegui i comandi **uno alla volta**.

## 1. Entra nella cartella del progetto
```bash
cd /Users/sam/vita
```
Il prompt deve diventare `vita %`. Verifica con `ls`: devi vedere `package.json`, `ios`, `capacitor.config.ts`.

> Se sbagli e resti nella home (`~`), i comandi `git` danno "not a git repository": rientra con il `cd` qui sopra.

## 2. Scarica il ramo aggiornato
```bash
git fetch origin
git checkout claude/vyta-candy-ui-restyle-hdzg0g
git pull origin claude/vyta-candy-ui-restyle-hdzg0g
```

## 3. Installa e builda il web
```bash
npm install
npm run build
```
Deve finire con `✓ built`. (I warning PUPPETEER e "N vulnerabilities" sono normali, non bloccano.)

## 4. Sincronizza iOS e apri Xcode
```bash
npx cap sync ios
npx cap open ios
```

## 5. In Xcode (interfaccia grafica)
1. **App** → **Signing & Capabilities** → scegli il **Team**. Verifica **App Groups** = `group.app.vita.lifeos` su **App** e su **VytaWidgets**.
2. **General → Build**: aumenta **sempre** il numero (es. 2 → 3), altrimenti l'upload viene rifiutato. Alza **Version** solo per una nuova versione pubblica.
3. Target Membership dei file Swift:
   - `VytaWidgets.swift` → target **VytaWidgets**
   - `OcrBridge.swift`, `WidgetBridge.swift`, `MainViewController.swift` → target **App**
4. In alto: **Any iOS Device (arm64)**.
5. **Product → Archive** → al termine **Distribute App → App Store Connect → Upload**.

## 6. App Store Connect (browser)
La build appare in **TestFlight** dopo qualche minuto; da lì crei/invii la versione in review.

> Nota: widget e OCR foto (Apple Vision) funzionano solo su **iPhone reale**, non sempre nel simulatore.
