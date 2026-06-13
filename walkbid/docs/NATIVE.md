# WalkBid — iOS native setup

The native iOS project lives in `walkbid/ios/` (Capacitor 8, Swift Package
Manager). Everything below runs on **macOS with Xcode** — it can't be built in a
Linux/CI sandbox.

## Prerequisites
- macOS + Xcode 15+
- Node 20+, `npm install` already run in `walkbid/`
- An Apple Developer account for device/TestFlight builds

## Build & run
```bash
cd walkbid
npm run build          # web build → dist/
npx cap sync ios       # copy dist + refresh plugins/config
npx cap open ios       # open in Xcode
```
In Xcode: select the **App** target → Signing & Capabilities → set your Team →
pick a device/simulator → Run.

## What's already configured
- **Bundle id** `com.walkbid.app`, **display name** WalkBid
  (`capacitor.config.ts`, `Info.plist`, `project.pbxproj`).
- **Dark-only UI** (`UIUserInterfaceStyle = Dark`), portrait-locked on iPhone,
  asphalt launch screen (`LaunchScreen.storyboard`).
- **App icon**: the MilestoneBar mark — `ios/.../AppIcon-512@2x.png`,
  regenerate with `node scripts/make-icon.mjs`.
- **Export compliance**: `ITSAppUsesNonExemptEncryption = false` (skips the
  upload prompt; WalkBid uses only standard HTTPS/WebCrypto).
- **Permission strings** (shown in-context, never at launch):
  camera, microphone, speech recognition, location-when-in-use, photo library.
- **US App Store storefront only** — set in App Store Connect, no code change.

## Plugins (SPM)
`app, camera, filesystem, geolocation, haptics, share, splash-screen,
status-bar` are wired via `ios/App/CapApp-SPM/Package.swift` (managed by the
Capacitor CLI — don't edit by hand).

### Voice / speech recognition
`@capacitor-community/speech-recognition` does **not** yet ship an SPM
`Package.swift`, so it is not linked in the SPM project. Consequences:
- The app still runs and **voice degrades gracefully to a text field**
  (`VoiceCapture` detects availability) — this is the spec's intended fallback.
- To enable **on-device** speech on iOS, integrate the plugin via CocoaPods:
  1. `cd walkbid && npx cap add ios` alternatives aside, add a `Podfile` to
     `ios/App` (or migrate the project to CocoaPods) and `pod install`.
  2. Or wait for the plugin's SPM support and re-run `npx cap sync ios`.
  The `NSSpeechRecognitionUsageDescription` / `NSMicrophoneUsageDescription`
  strings are already in `Info.plist`.

## Notes
- `ios/App/App/public/` (web build) and `ios/App/Pods/` are git-ignored —
  regenerate with `npx cap sync ios`.
- After changing app config or icons, re-run `npx cap sync ios`.
