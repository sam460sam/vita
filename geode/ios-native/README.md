# iOS native overlay

These files are **not** copied automatically by Capacitor. After you run
`npx cap add ios` (which generates `ios/App/…`), add them to the Xcode project
as described below. They deliver the App Store compliance pieces and the
"this is a real native app" signals (Widget + App Intent).

## Files

| File | Where it goes | Purpose |
|------|---------------|---------|
| `PrivacyInfo.xcprivacy` | `ios/App/App/PrivacyInfo.xcprivacy` (App target) | Privacy Manifest — "Data Not Collected" (§6) |
| `AppIntents/GeodeAppIntents.swift` | App target | Siri/Shortcuts: "Identify with Geode" (§2.11) |
| `GeodeWidget/GeodeWidget.swift` | New Widget Extension target | Home Screen "Stone of the Day" widget (§2.11) |
| `GeodeWidget/GeodeWidgetBundle.swift` | Widget Extension target | Widget bundle entry point |

## Step-by-step

1. **Generate the iOS project** (from `geode/`):
   ```bash
   npm run build
   npx cap add ios
   npx cap sync ios
   ```
2. **Open** `ios/App/App.xcworkspace` in Xcode 26.
3. **Privacy Manifest:** drag `PrivacyInfo.xcprivacy` into the `App` group,
   check the `App` target in "Add to targets".
4. **URL scheme** (enables the deep links the Widget/Intent use):
   `App` target ▸ *Info* ▸ *URL Types* ▸ **+** ▸ URL Schemes = `geode`.
   The JS side is already wired (`appUrlOpen` → `geode://scan` → scan flow).
5. **App Intent:** File ▸ New ▸ File ▸ *Swift File* → add
   `GeodeAppIntents.swift` to the `App` target.
6. **Widget:** File ▸ New ▸ *Target…* ▸ **Widget Extension**, name it
   `GeodeWidget`. Replace its generated files with the two files in
   `GeodeWidget/`. Set its Deployment Target to iOS 16.
7. **Camera/photos usage strings** — add to `ios/App/App/Info.plist`
   (Xcode: App target ▸ Info):
   - `NSCameraUsageDescription` → *"Geode uses the camera to photograph and
     identify crystals, rocks and gems."*
   - `NSPhotoLibraryUsageDescription` → *"Geode lets you pick a photo of a stone
     from your library to identify it."*
8. Build & run. Test the App Intent in the **Shortcuts** app ("Identify with
   Geode"), and add the widget from the Home Screen.

> If you're short on time, the App Intent alone satisfies the "not a wrapper"
> bar — the Widget is the bonus. Both are provided here, ready to drop in.
