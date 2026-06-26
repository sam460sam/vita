// ============================================================================
// Geode — Home Screen Widget (BUILD-SPEC §2.11)
//
// A "Stone of the Day" widget + an "Identify" deep-link. Together with the App
// Intent above, a Widget is the clearest signal to App Review that Geode is a
// real native experience, not a web wrapper.
//
// SETUP (Xcode 26):
//   1. After `npx cap add ios`, open ios/App/App.xcworkspace.
//   2. File ▸ New ▸ Target ▸ "Widget Extension" → name "GeodeWidget".
//      Uncheck "Include Configuration App Intent" (we keep it static + simple).
//   3. Replace the generated GeodeWidget.swift with this file, and add
//      GeodeWidgetBundle.swift.
//   4. Ensure the widget target's Deployment Target is iOS 16+.
//   5. Build & run, then long-press the Home Screen ▸ add the Geode widget.
// ============================================================================

import WidgetKit
import SwiftUI

// MARK: - Local "Stone of the Day" content (mirrors src/data/reference.ts)

struct WidgetStone {
    let name: String
    let scientific: String
    let mohs: String
    let fact: String
}

private let stones: [WidgetStone] = [
    WidgetStone(name: "Amethyst", scientific: "SiO₂ (quartz)", mohs: "7", fact: "Purple quartz coloured by trace iron and natural irradiation."),
    WidgetStone(name: "Clear Quartz", scientific: "SiO₂", mohs: "7", fact: "The reference mineral for hardness 7 on the Mohs scale."),
    WidgetStone(name: "Rose Quartz", scientific: "SiO₂", mohs: "7", fact: "Pink quartz coloured by microscopic mineral inclusions."),
    WidgetStone(name: "Citrine", scientific: "SiO₂", mohs: "7", fact: "Golden quartz; natural citrine is rare, most is heat-treated amethyst."),
    WidgetStone(name: "Fluorite", scientific: "CaF₂", mohs: "4", fact: "Fluoresces under UV — the word ‘fluorescence’ is named after it."),
    WidgetStone(name: "Pyrite", scientific: "FeS₂", mohs: "6–6.5", fact: "‘Fool’s gold’ — forms striking metallic cubic crystals."),
    WidgetStone(name: "Selenite", scientific: "Gypsum", mohs: "2", fact: "So soft a fingernail scratches it; forms long translucent beams."),
    WidgetStone(name: "Obsidian", scientific: "Volcanic glass", mohs: "5–5.5", fact: "Natural glass from rapidly cooled lava; fractures razor-sharp."),
    WidgetStone(name: "Labradorite", scientific: "Feldspar", mohs: "6–6.5", fact: "Flashes blue-green ‘labradorescence’ from internal light interference."),
    WidgetStone(name: "Tiger’s Eye", scientific: "SiO₂", mohs: "7", fact: "Silky ‘cat’s-eye’ shimmer from parallel fibrous inclusions."),
]

private func stoneOfTheDay(_ date: Date) -> WidgetStone {
    let day = Calendar.current.ordinality(of: .day, in: .year, for: date) ?? 1
    return stones[(day - 1) % stones.count]
}

// MARK: - Timeline

struct StoneEntry: TimelineEntry {
    let date: Date
    let stone: WidgetStone
}

struct GeodeProvider: TimelineProvider {
    func placeholder(in context: Context) -> StoneEntry {
        StoneEntry(date: Date(), stone: stones[0])
    }
    func getSnapshot(in context: Context, completion: @escaping (StoneEntry) -> Void) {
        completion(StoneEntry(date: Date(), stone: stoneOfTheDay(Date())))
    }
    func getTimeline(in context: Context, completion: @escaping (Timeline<StoneEntry>) -> Void) {
        // One entry per day at local midnight so it refreshes daily.
        var entries: [StoneEntry] = []
        let cal = Calendar.current
        let startOfToday = cal.startOfDay(for: Date())
        for offset in 0..<3 {
            if let day = cal.date(byAdding: .day, value: offset, to: startOfToday) {
                entries.append(StoneEntry(date: day, stone: stoneOfTheDay(day)))
            }
        }
        completion(Timeline(entries: entries, policy: .atEnd))
    }
}

// MARK: - View

struct GeodeWidgetEntryView: View {
    var entry: StoneEntry
    @Environment(\.widgetFamily) var family

    var body: some View {
        ZStack {
            LinearGradient(
                colors: [Color(red: 0.04, green: 0.04, blue: 0.05), Color(red: 0.10, green: 0.07, blue: 0.19)],
                startPoint: .topLeading, endPoint: .bottomTrailing
            )
            VStack(alignment: .leading, spacing: 6) {
                Text("STONE OF THE DAY")
                    .font(.system(size: 10, weight: .bold))
                    .foregroundStyle(Color(red: 0.66, green: 0.48, blue: 1.0))
                    .tracking(1)
                Text(entry.stone.name)
                    .font(.system(size: family == .systemSmall ? 18 : 22, weight: .bold))
                    .foregroundStyle(.white)
                Text(entry.stone.scientific)
                    .font(.system(size: 11))
                    .italic()
                    .foregroundStyle(.white.opacity(0.6))
                if family != .systemSmall {
                    Text(entry.stone.fact)
                        .font(.system(size: 12))
                        .foregroundStyle(.white.opacity(0.85))
                        .lineLimit(3)
                        .padding(.top, 2)
                }
                Spacer(minLength: 0)
                HStack {
                    Label("Mohs \(entry.stone.mohs)", systemImage: "diamond")
                        .font(.system(size: 10, weight: .semibold))
                        .foregroundStyle(.white.opacity(0.8))
                    Spacer()
                    Label("Identify", systemImage: "camera.viewfinder")
                        .font(.system(size: 11, weight: .bold))
                        .foregroundStyle(Color(red: 0.94, green: 0.76, blue: 1.0))
                }
            }
            .padding(14)
        }
        // Tapping the widget deep-links into the scan flow.
        .widgetURL(URL(string: "geode://scan"))
    }
}

// MARK: - Widget

struct GeodeWidget: Widget {
    let kind: String = "GeodeWidget"
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: GeodeProvider()) { entry in
            if #available(iOS 17.0, *) {
                GeodeWidgetEntryView(entry: entry)
                    .containerBackground(.fill.tertiary, for: .widget)
            } else {
                GeodeWidgetEntryView(entry: entry)
            }
        }
        .configurationDisplayName("Geode")
        .description("Today's Stone of the Day. Tap to identify a stone.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}
