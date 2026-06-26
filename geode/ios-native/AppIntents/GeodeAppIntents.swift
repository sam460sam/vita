// ============================================================================
// Geode — App Intents (BUILD-SPEC §2.11)
//
// Exposes Geode actions to Siri, Spotlight and the Shortcuts app. This is the
// strongest "not a wrapper" signal for App Review (anti 4.2/4.3).
//
// SETUP (Xcode 26):
//   1. After `npx cap add ios`, open ios/App/App.xcworkspace.
//   2. File ▸ New ▸ File ▸ Swift File → "GeodeAppIntents.swift", add to the
//      "App" target. Paste this file.
//   3. Add a URL type so the intent can deep-link the WebView:
//        Target "App" ▸ Info ▸ URL Types ▸ + ▸ URL Schemes = "geode"
//      (Capacitor forwards geode://scan to JS via appUrlOpen — already wired.)
//   4. Build. Try it from the Shortcuts app: "Identify with Geode".
// ============================================================================

import AppIntents
import UIKit

@available(iOS 16.0, *)
struct IdentifyStoneIntent: AppIntent {
    static var title: LocalizedStringResource = "Identify with Geode"
    static var description = IntentDescription("Open Geode and start identifying a crystal, rock or gem.")

    // Bring the app to the foreground when run.
    static var openAppWhenRun: Bool = true

    @MainActor
    func perform() async throws -> some IntentResult {
        if let url = URL(string: "geode://scan") {
            await UIApplication.shared.open(url)
        }
        return .result()
    }
}

@available(iOS 16.0, *)
struct StoneOfTheDayIntent: AppIntent {
    static var title: LocalizedStringResource = "Stone of the Day"
    static var description = IntentDescription("Open Geode to today's featured stone.")
    static var openAppWhenRun: Bool = true

    @MainActor
    func perform() async throws -> some IntentResult {
        if let url = URL(string: "geode://stone-of-the-day") {
            await UIApplication.shared.open(url)
        }
        return .result()
    }
}

@available(iOS 16.0, *)
struct GeodeShortcuts: AppShortcutsProvider {
    static var appShortcuts: [AppShortcut] {
        AppShortcut(
            intent: IdentifyStoneIntent(),
            phrases: [
                "Identify a stone with \(.applicationName)",
                "Scan a crystal with \(.applicationName)",
                "Open \(.applicationName) identifier"
            ],
            shortTitle: "Identify",
            systemImageName: "camera.viewfinder"
        )
        AppShortcut(
            intent: StoneOfTheDayIntent(),
            phrases: ["Show \(.applicationName) stone of the day"],
            shortTitle: "Stone of the Day",
            systemImageName: "sparkles"
        )
    }
}
