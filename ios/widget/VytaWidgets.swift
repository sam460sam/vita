// ============================================================================
// Vyta — Home & Lock Screen widgets (WidgetKit / SwiftUI).
//
// Add this file to a new "Widget Extension" target named `VytaWidgets`
// (see WIDGETS.md). Both the app target and this widget target must share the
// App Group "group.app.vita.lifeos".
//
// Data comes from the web app, which mirrors values into the shared App Group
// via @capacitor/preferences (see src/platform/widget.ts):
//   key "vyta_widget"        → { water: { ml, goalMl }, reminders: [...] }
//   key "vyta_widget_inbox"  → accumulated ml logged from the widget button
// ============================================================================
import WidgetKit
import SwiftUI
import AppIntents

let APP_GROUP = "group.app.vita.lifeos"
let WIDGET_KEY = "vyta_widget"
let INBOX_KEY = "vyta_widget_inbox"

// MARK: - Shared data

struct WidgetReminder: Decodable, Hashable { let label: String; let time: String }
struct WidgetWater: Decodable { let ml: Int; let goalMl: Int }
struct WidgetData: Decodable { let water: WidgetWater; let reminders: [WidgetReminder] }

func readWidgetData() -> WidgetData {
    let fallback = WidgetData(water: .init(ml: 0, goalMl: 2000), reminders: [])
    guard let defaults = UserDefaults(suiteName: APP_GROUP),
          let raw = defaults.string(forKey: WIDGET_KEY),
          let data = raw.data(using: .utf8),
          let decoded = try? JSONDecoder().decode(WidgetData.self, from: data)
    else { return fallback }
    return decoded
}

// MARK: - Interactive water logging (iOS 17+)

struct LogWaterIntent: AppIntent {
    static var title: LocalizedStringResource = "Log water"
    @Parameter(title: "Milliliters") var ml: Int
    init() { ml = 250 }
    init(ml: Int) { self.ml = ml }

    func perform() async throws -> some IntentResult {
        if let defaults = UserDefaults(suiteName: APP_GROUP) {
            let pending = defaults.integer(forKey: INBOX_KEY)
            defaults.set(pending + ml, forKey: INBOX_KEY)
            // Optimistically bump the displayed total too.
            if let raw = defaults.string(forKey: WIDGET_KEY),
               let d = raw.data(using: .utf8),
               var obj = try? JSONSerialization.jsonObject(with: d) as? [String: Any],
               var water = obj["water"] as? [String: Any],
               let cur = water["ml"] as? Int {
                water["ml"] = cur + ml
                obj["water"] = water
                if let out = try? JSONSerialization.data(withJSONObject: obj),
                   let s = String(data: out, encoding: .utf8) {
                    defaults.set(s, forKey: WIDGET_KEY)
                }
            }
        }
        return .result()
    }
}

// MARK: - Timeline provider

struct VytaEntry: TimelineEntry { let date: Date; let data: WidgetData }

struct VytaProvider: TimelineProvider {
    func placeholder(in context: Context) -> VytaEntry { VytaEntry(date: Date(), data: readWidgetData()) }
    func getSnapshot(in context: Context, completion: @escaping (VytaEntry) -> Void) {
        completion(VytaEntry(date: Date(), data: readWidgetData()))
    }
    func getTimeline(in context: Context, completion: @escaping (Timeline<VytaEntry>) -> Void) {
        let entry = VytaEntry(date: Date(), data: readWidgetData())
        // Refresh roughly every 30 min (WidgetKit budget permitting).
        let next = Calendar.current.date(byAdding: .minute, value: 30, to: Date())!
        completion(Timeline(entries: [entry], policy: .after(next)))
    }
}

// MARK: - Colors

let vGreen = Color(red: 0.086, green: 0.639, blue: 0.290)   // #16a34a
let vBlue  = Color(red: 0.055, green: 0.647, blue: 0.914)   // #0EA5E9
let vCream = Color(red: 0.973, green: 0.945, blue: 0.902)   // #f8f1e6
let vInk   = Color(red: 0.165, green: 0.125, blue: 0.094)   // #2a2018

// MARK: - Water widget

struct WaterWidgetView: View {
    @Environment(\.widgetFamily) var family
    let data: WidgetData
    var progress: Double { data.water.goalMl > 0 ? min(1, Double(data.water.ml) / Double(data.water.goalMl)) : 0 }
    var liters: String { String(format: "%.1fL", Double(data.water.ml) / 1000) }

    var body: some View {
        switch family {
        case .accessoryCircular:
            Gauge(value: progress) { Image(systemName: "drop.fill") }
                .gaugeStyle(.accessoryCircular)
        default:
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Image(systemName: "drop.fill").foregroundColor(vBlue)
                    Text("Acqua").font(.caption).bold().foregroundColor(.secondary)
                    Spacer()
                }
                Text(liters).font(.system(size: 30, weight: .heavy)).foregroundColor(vInk)
                Text("\(Int(progress * 100))% di \(String(format: "%.1fL", Double(data.water.goalMl)/1000))")
                    .font(.caption2).foregroundColor(.secondary)
                Spacer()
                if #available(iOS 17.0, *) {
                    Button(intent: LogWaterIntent(ml: 250)) {
                        Label("250 ml", systemImage: "plus")
                            .font(.caption).bold().frame(maxWidth: .infinity)
                    }
                    .tint(vBlue)
                    .buttonBorderShape(.capsule)
                }
            }
            .padding()
        }
    }
}

struct WaterWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "VytaWaterWidget", provider: VytaProvider()) { entry in
            if #available(iOS 17.0, *) {
                WaterWidgetView(data: entry.data).containerBackground(vCream, for: .widget)
            } else {
                WaterWidgetView(data: entry.data).background(vCream)
            }
        }
        .configurationDisplayName("Vyta · Acqua")
        .description("Segna l’acqua di oggi.")
        .supportedFamilies([.systemSmall, .accessoryCircular])
    }
}

// MARK: - Reminders widget

struct RemindersWidgetView: View {
    @Environment(\.widgetFamily) var family
    let data: WidgetData

    var body: some View {
        switch family {
        case .accessoryRectangular:
            VStack(alignment: .leading, spacing: 2) {
                Text("Promemoria").font(.caption2).bold()
                ForEach(data.reminders.prefix(2), id: \.self) { r in
                    Text("\(r.time)  \(r.label)").font(.caption2).lineLimit(1)
                }
                if data.reminders.isEmpty { Text("Nessun promemoria").font(.caption2).foregroundColor(.secondary) }
            }
        default:
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Image(systemName: "bell.fill").foregroundColor(vGreen)
                    Text("Promemoria").font(.caption).bold().foregroundColor(.secondary)
                    Spacer()
                }
                if data.reminders.isEmpty {
                    Spacer()
                    Text("Nessun promemoria").font(.subheadline).foregroundColor(.secondary)
                    Spacer()
                } else {
                    ForEach(data.reminders.prefix(family == .systemLarge ? 6 : 3), id: \.self) { r in
                        HStack(spacing: 8) {
                            Text(r.time).font(.caption).bold().foregroundColor(vGreen).frame(width: 44, alignment: .leading)
                            Text(r.label).font(.caption).foregroundColor(vInk).lineLimit(1)
                            Spacer()
                        }
                    }
                    Spacer()
                }
            }
            .padding()
        }
    }
}

struct RemindersWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "VytaRemindersWidget", provider: VytaProvider()) { entry in
            if #available(iOS 17.0, *) {
                RemindersWidgetView(data: entry.data).containerBackground(vCream, for: .widget)
            } else {
                RemindersWidgetView(data: entry.data).background(vCream)
            }
        }
        .configurationDisplayName("Vyta · Promemoria")
        .description("I tuoi promemoria del giorno.")
        .supportedFamilies([.systemSmall, .systemMedium, .accessoryRectangular])
    }
}

// MARK: - Bundle

@main
struct VytaWidgets: WidgetBundle {
    var body: some Widget {
        WaterWidget()
        RemindersWidget()
    }
}
