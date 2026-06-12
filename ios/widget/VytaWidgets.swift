// ============================================================================
// Vyta — Home & Lock Screen widgets (WidgetKit / SwiftUI).
//
// Add this file to a new "Widget Extension" target named `VytaWidgets`
// (see WIDGETS.md). Both the app target and this widget target must share the
// App Group "group.app.vita.lifeos".
//
// Sizes: Small · Medium · Large (Home) + Circular / Rectangular (Lock Screen).
// Language: follows the device language (Italian / English) automatically.
//
// Data comes from the web app (src/platform/widget.ts):
//   key "vyta_widget"        → { water: { ml, goalMl }, reminders: [...] }
//   key "vyta_widget_inbox"  → accumulated ml logged from the widget button
// ============================================================================
import WidgetKit
import SwiftUI
import AppIntents

let APP_GROUP = "group.app.vita.lifeos"
let WIDGET_KEY = "vyta_widget"
let INBOX_KEY = "vyta_widget_inbox"

// MARK: - Localization (device language)

enum L {
    static var isIT: Bool { (Locale.current.language.languageCode?.identifier ?? "en") == "it" }
    static func t(_ it: String, _ en: String) -> String { isIT ? it : en }
}

func litersStr(_ ml: Int) -> String {
    let s = String(format: "%.1f", Double(ml) / 1000)
    return (L.isIT ? s.replacingOccurrences(of: ".", with: ",") : s) + "L"
}

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
        let next = Calendar.current.date(byAdding: .minute, value: 30, to: Date())!
        completion(Timeline(entries: [entry], policy: .after(next)))
    }
}

// MARK: - Colors

let vGreen = Color(red: 0.086, green: 0.639, blue: 0.290)   // #16a34a
let vBlue  = Color(red: 0.055, green: 0.647, blue: 0.914)   // #0EA5E9
let vCream = Color(red: 0.973, green: 0.945, blue: 0.902)   // #f8f1e6
let vInk   = Color(red: 0.165, green: 0.125, blue: 0.094)   // #2a2018

// MARK: - Reusable bits

struct WaterRing: View {
    let progress: Double
    let size: CGFloat
    var body: some View {
        ZStack {
            Circle().stroke(vBlue.opacity(0.18), lineWidth: size * 0.12)
            Circle().trim(from: 0, to: progress)
                .stroke(vBlue, style: StrokeStyle(lineWidth: size * 0.12, lineCap: .round))
                .rotationEffect(.degrees(-90))
            Image(systemName: "drop.fill").foregroundColor(vBlue).font(.system(size: size * 0.34))
        }
        .frame(width: size, height: size)
    }
}

@ViewBuilder
func addButton(_ ml: Int, _ label: String) -> some View {
    if #available(iOS 17.0, *) {
        Button(intent: LogWaterIntent(ml: ml)) {
            Label(label, systemImage: "plus").font(.caption).bold().frame(maxWidth: .infinity)
        }
        .tint(vBlue)
        .buttonBorderShape(.capsule)
    }
}

// MARK: - Water widget

struct WaterWidgetView: View {
    @Environment(\.widgetFamily) var family
    let data: WidgetData
    var progress: Double { data.water.goalMl > 0 ? min(1, Double(data.water.ml) / Double(data.water.goalMl)) : 0 }

    var header: some View {
        HStack(spacing: 5) {
            Image(systemName: "drop.fill").foregroundColor(vBlue)
            Text(L.t("Acqua", "Water")).font(.caption).bold().foregroundColor(.secondary)
            Spacer()
        }
    }

    var body: some View {
        switch family {
        case .accessoryCircular:
            Gauge(value: progress) { Image(systemName: "drop.fill") }.gaugeStyle(.accessoryCircular)

        case .systemMedium:
            HStack(spacing: 16) {
                WaterRing(progress: progress, size: 80)
                VStack(alignment: .leading, spacing: 4) {
                    header
                    Text(litersStr(data.water.ml)).font(.system(size: 28, weight: .heavy)).foregroundColor(vInk)
                    Text("\(L.t("Obiettivo", "Goal")) \(litersStr(data.water.goalMl))").font(.caption2).foregroundColor(.secondary)
                    addButton(250, "250 ml")
                }
            }.padding()

        case .systemLarge:
            VStack(alignment: .leading, spacing: 14) {
                header
                HStack {
                    Spacer(); WaterRing(progress: progress, size: 150); Spacer()
                }
                Text(litersStr(data.water.ml) + " / " + litersStr(data.water.goalMl))
                    .font(.system(size: 26, weight: .heavy)).foregroundColor(vInk).frame(maxWidth: .infinity, alignment: .center)
                Text("\(Int(progress * 100))% · \(data.water.ml / 200) \(L.t("bicchieri", "glasses"))")
                    .font(.subheadline).foregroundColor(.secondary).frame(maxWidth: .infinity, alignment: .center)
                Spacer()
                HStack(spacing: 10) { addButton(250, "250 ml"); addButton(500, "500 ml") }
            }.padding()

        default: // systemSmall
            VStack(alignment: .leading, spacing: 6) {
                header
                Text(litersStr(data.water.ml)).font(.system(size: 30, weight: .heavy)).foregroundColor(vInk)
                Text("\(Int(progress * 100))% · \(litersStr(data.water.goalMl))").font(.caption2).foregroundColor(.secondary)
                Spacer()
                addButton(250, "250 ml")
            }.padding()
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
        .configurationDisplayName(L.t("Vyta · Acqua", "Vyta · Water"))
        .description(L.t("Segna l’acqua di oggi.", "Log today’s water."))
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge, .accessoryCircular])
    }
}

// MARK: - Reminders widget

struct RemindersWidgetView: View {
    @Environment(\.widgetFamily) var family
    let data: WidgetData
    var title: String { L.t("Promemoria", "Reminders") }
    var empty: String { L.t("Nessun promemoria", "No reminders") }

    func row(_ r: WidgetReminder) -> some View {
        HStack(spacing: 8) {
            Text(r.time).font(.caption).bold().foregroundColor(vGreen).frame(width: 46, alignment: .leading)
            Text(r.label).font(.caption).foregroundColor(vInk).lineLimit(1)
            Spacer()
        }
    }

    var header: some View {
        HStack(spacing: 5) {
            Image(systemName: "bell.fill").foregroundColor(vGreen)
            Text(title).font(.caption).bold().foregroundColor(.secondary)
            Spacer()
        }
    }

    var body: some View {
        switch family {
        case .accessoryRectangular:
            VStack(alignment: .leading, spacing: 2) {
                Text(title).font(.caption2).bold()
                ForEach(data.reminders.prefix(2), id: \.self) { r in Text("\(r.time)  \(r.label)").font(.caption2).lineLimit(1) }
                if data.reminders.isEmpty { Text(empty).font(.caption2).foregroundColor(.secondary) }
            }

        default:
            let count = family == .systemLarge ? 8 : (family == .systemMedium ? 4 : 3)
            VStack(alignment: .leading, spacing: family == .systemSmall ? 4 : 8) {
                header
                if data.reminders.isEmpty {
                    Spacer(); Text(empty).font(.subheadline).foregroundColor(.secondary); Spacer()
                } else {
                    ForEach(data.reminders.prefix(count), id: \.self) { r in row(r) }
                    Spacer()
                }
            }.padding()
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
        .configurationDisplayName(L.t("Vyta · Promemoria", "Vyta · Reminders"))
        .description(L.t("I tuoi promemoria del giorno.", "Your reminders for the day."))
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge, .accessoryRectangular])
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
