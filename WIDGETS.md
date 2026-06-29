# Vyta Home & Lock Screen widgets — setup (Xcode, on the Mac)

Two widgets: **Acqua** (log water with a button, iOS 17+) and **Promemoria**
(today's reminders). They also work on the **Lock Screen** (circular for water,
rectangular for reminders).

The web app already mirrors the data into a shared **App Group** (see
`src/platform/widget.ts`). You only need to add the native widget target once.

## 1. Add an App Group (shared container)
1. Xcode → select the **App** target → **Signing & Capabilities**.
2. **+ Capability → App Groups**. Add `group.app.vita.lifeos`.
3. Make sure the checkbox next to it is **ticked**.

## 1b. ⚠️ Native data bridge (REQUIRED — this is why old widgets stayed empty)
`@capacitor/preferences` does NOT write to the App Group suite — it writes to
`UserDefaults.standard` with a prefixed key, which the widget extension cannot read.
The repo now includes `ios/App/App/WidgetBridge.swift`, a tiny plugin that writes the
raw key into `UserDefaults(suiteName: "group.app.vita.lifeos")`. The JS in
`src/platform/widget.ts` calls it automatically (with a safe fallback).
1. In Xcode select `WidgetBridge.swift` → File Inspector → **Target Membership** →
   tick **App**. If it's not in the project: File → Add Files… → `App/WidgetBridge.swift`
   → tick **App**.
2. Nothing else to wire — Capacitor auto-registers it (CAPBridgedPlugin).

## 2. Create the Widget Extension target
1. **File → New → Target… → Widget Extension**.
2. Product name: **VytaWidgets**. **Uncheck** "Include Live Activity".
   Finish, and when asked, **Activate** the scheme.
3. Xcode created a `VytaWidgets/` group with a sample `.swift` file and an
   `Info.plist`. **Delete the sample `.swift`** file (move to trash).
4. **Add** the provided `ios/widget/VytaWidgets.swift` to the **VytaWidgets**
   target (drag it into the group, or File → Add Files…, and tick the
   *VytaWidgets* target — NOT the app target).

## 3. Give the widget the same App Group
1. Select the **VytaWidgets** target → **Signing & Capabilities**.
2. **+ Capability → App Groups** → tick `group.app.vita.lifeos` (same id).
3. Set the **Team** (same as the app).

## 4. Build & run
- Select the **App** scheme and run on your device once (so the app writes the
  shared data: open the Home screen).
- Then long-press the Home Screen → **+** → search **Vyta** → add **Acqua** /
  **Promemoria**. For the Lock Screen: customise the lock screen → add widgets.

## How it works / notes
- **Display data**: web writes `vyta_widget` (water + reminders) to the App
  Group on every Home view. Widgets refresh on WidgetKit's schedule (~30 min)
  and whenever the system wakes them.
- **Logging water from the widget** (iOS 17+): the "+250 ml" button writes the
  amount to `vyta_widget_inbox`; the app applies it to today's total the next
  time it opens (`drainWidgetWaterInbox` in `HomeDashboard`).
- The widget copy is currently Italian; localise the strings in
  `VytaWidgets.swift` if you want English too (WidgetKit can read `Localizable`
  strings, or hardcode per `Locale.current`).
- If the widget shows zeros, confirm BOTH targets share the **exact** App Group
  id and that you opened the app once after installing.

## App Store
No extra review steps: widgets ship inside the same app binary. Just archive
and upload as usual (build number already bumped in the repo).
