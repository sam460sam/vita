# Vyta — Rilascio 1.3 (build 37)

Branch: `claude/vyta-candy-ui-restyle-hdzg0g` · Versione **1.3** · Build **37**

## ✨ Novità 1.3 — testo per App Store ("Novità")

**Italiano**
```
• Nuovo: Test della personalità — scopri il tuo tipo tra 16 profili. Risultato base gratuito; profilo completo con un acquisto singolo.
• Acqua: scheda dedicata con calcolatore del fabbisogno giornaliero (peso, altezza, attività).
• Home riordinata e più pulita, con frasi motivazionali che cambiano di continuo.
• Notifiche più simpatiche e varie (acqua, allenamento, diario…).
• Tante piccole migliorie e correzioni; traduzioni complete IT/EN.
```

**English**
```
• New: Personality test — discover your type across 16 profiles. Free base result; full profile with a one-time purchase.
• Water: a dedicated tab with a daily-need calculator (weight, height, activity).
• Cleaner, reordered Home with motivational quotes that keep rotating.
• Friendlier, more varied notifications (water, workout, journal…).
• Many small improvements and fixes; complete IT/EN translations.
```

## 🧩 Cosa è cambiato in 1.3
- **Tab bar**: Oggi · Abitudini · Salute · **Acqua** · **Test** · Altro (Note e Progetti spostati in "Altro").
- **Test personalità**: 48 domande, 16 tipi MBTI, contenuti originali bilingui; risultato base gratis + profilo completo (Punti di forza, Aree di crescita, Lavoro, Carriere ideali, Sotto stress, Relazioni, Come ti percepiscono) sbloccabile a €3,99 una tantum.
- **Acqua** come modulo gratuito con calcolatore idratazione (peso + altezza + livello di attività).
- **Backup** spostato nella pagina "Altro".
- **Frasi motivazionali**: 20 IT + 20 EN, ruotano ogni 10s.
- **Notifiche**: testi vari e accattivanti (acqua a intervalli + varianti per ogni tipo).
- **Fix**: giorni della settimana ora localizzati; heatmap abitudini vuota che si riempie solo con le spunte reali.

## 🛒 In-app purchase da allegare alla versione
- `vyta_pro_monthly` — abbonamento €3,99/mese (Ready to Submit)
- `vyta_pro_yearly` — abbonamento €29,99/anno (Ready to Submit)
- `vyta_personality_full` — **non-consumabile €3,99** (DA CREARE su App Store Connect)

## 🖼️ Copertine App Store (1290×2796 / 6.7"–6.9")
Generate e inviate in chat: 5 slide **IT** + 5 slide **EN** (Home, Test personalità, Acqua, Abitudini, Salute).

## 🔒 Privacy
Resta **Data Not Collected**: StoreKit nativo on-device, nessun servizio terzo.

## 🔑 Chiavi
- Branch `claude/vyta-candy-ui-restyle-hdzg0g` · **1.3 / build 37**
- App Group (entrambi i target): `group.app.vita.lifeos`
- Bundle: app `app.vita.lifeos` · widget `app.vita.lifeos.VytaWidgets`
- ⚠️ Aggiornare con `git fetch` + `git checkout origin/<branch> -- <paths>` (MAI `git reset --hard` né `git pull`)
- ⚠️ Prima dell'Archive: rimuovere `Vyta.storekit` dallo schema (Run → Options → StoreKit Configuration → None)
- Min iOS del widget: **17.0**
