# Vita — Crescita, marketing e pricing

Documento strategico (non codice). Sintesi di cosa rende le app "amate" e come
portare Vita al lancio e oltre.

## La nicchia di Vita (il nostro vantaggio)
Le app di successo sono **mono-tema** (Finch = self-care, Cal AI = calorie,
Habitica = abitudini). Nessuna unisce **tutta la vita**. Vita ha un dato che
loro non hanno: **tutto insieme**. Da qui il **Momentum** (punteggio cross-life
0–100 + Stella che reagisce a tutta la giornata): impossibile da copiare per
un'app a tema singolo.

## I 5 pilastri (stato)
1. **Onboarding con "aha moment"** ✅ — scelta del focus + schermata finale che
   mostra il punto di partenza (abitudini create, focus). +50% retention tipica.
2. **Notifica serale intelligente** ✅ — promemoria "Chiudi la giornata" legato
   al Momentum (Impostazioni → Promemoria → Chiudi la giornata).
3. **Riepilogo settimanale condivisibile** ✅ — pagina Recap che genera
   un'immagine PNG bella da condividere (Stella + numeri). Crescita organica.
4. **Marketing** — playbook qui sotto.
5. **Pricing** — modello qui sotto.

---

## 4) Marketing playbook (budget ~0)

**Posizionamento (una frase):**
> "Vita: il tuo life OS. Salute, abitudini, progetti e umore in un'unica app —
> privata e offline. Con Stella che ti accompagna ogni giorno."

**Canali, in ordine di efficacia per app personali:**
- **Video brevi (TikTok / Reels / Shorts):** è così che Cal AI è esplosa, a
  costo zero. Format che funzionano:
  - "POV: un'app che ti mostra tutta la tua vita in un punteggio" (mostra il Momentum + confetti)
  - "Ho tracciato la mia settimana per 7 giorni" → mostra il **Recap condivisibile**
  - "App diary" / before-after, screen recording reali, 15–30s, hook nei primi 2s.
- **Micro-influencer di nicchia** (1k–50k follower) su produttività, benessere,
  fitness: regala accesso Pro a vita in cambio di un video onesto. ROI altissimo.
- **Reddit / forum:** r/productivity, r/getdisciplined, r/selfimprovement,
  r/QuantifiedSelf — condividi la storia ("ho costruito un life OS privato"),
  non spam. La privacy/offline è un argomento forte lì.
- **Product Hunt** al lancio: prepara GIF del Momentum + Recap, raccogli upvote.
- **ASO (App Store Optimization):** keyword nel titolo/sottotitolo
  ("habit tracker, life planner, mood journal, water, weight"), 5–6 screenshot
  che raccontano una storia, video di anteprima. Le prime 2 schermate decidono.

**Loop di crescita integrato:** ogni Recap condiviso ha "Tracked with Vita ⭐"
→ chi lo vede scopre l'app. Più persone tracciano, più Recap girano.

**Metriche da guardare:** D1/D7/D30 retention (obiettivo D7 > 25%), % che
completa l'onboarding, % che condivide un Recap, conversione free→Pro.

---

## 5) Pricing (free generoso + Pro)

**Principio:** far innamorare prima, monetizzare dopo. La maggior parte resta
free; chi ama l'app passa a Pro.

**Free (per sempre):**
- Oggi + Momentum + Stella, Abitudini, Attività base, Acqua, Diario,
  Progetti/Task, Peso base, export/import, 2 lingue.

**Vita Pro — 3 €/mese o 30 €/anno (2 mesi gratis):**
- Finanze + import CSV + flusso "Dove vanno i soldi"
- Obiettivi avanzati (tappe) e statistiche estese
- Calendario unificato
- Foto progressi illimitate / temi extra / futuri moduli
- (già "gated" nel codice: `src/premium/premium.tsx`)

**Come attivare i pagamenti reali (quando vuoi):**
- iOS/Android obbligano i pagamenti in-app dello store (no Stripe per contenuti
  digitali). Strumento consigliato: **RevenueCat** (gratis fino a ~2.500 $/mese).
- Passi: crea i prodotti su App Store Connect / Play Console → integra il plugin
  RevenueCat → sostituisci la risoluzione di `isPremium` con l'entitlement.
  Il resto dell'app (gating, pagina Pro) non cambia.
- Trattenuta store: 15–30%. Su 3 € → ~2,10–2,55 € netti.

**Leve di conversione (etiche):**
- Trial di 7 giorni di Pro all'onboarding (mostra il valore, poi torna free).
- Paywall contestuale: quando si tocca una funzione Pro, spiega il beneficio.
- Sconto annuale ben visibile ("2 mesi gratis").

---

## Checklist pre-lancio
- [ ] Build nativa iOS/Android (vedi `NATIVE.md`)
- [ ] Attiva notifiche + (opzionale) HealthKit
- [ ] Screenshot store (Momentum, Recap, Attività, Finanze flow, dark mode)
- [ ] Testo store IT/EN + privacy policy (dati solo sul dispositivo = punto forte)
- [ ] Prodotti Pro + RevenueCat
- [ ] 5–10 video brevi pronti + post Reddit/Product Hunt
