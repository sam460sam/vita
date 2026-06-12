// ============================================================================
// Vyta — Home & Lock Screen widgets (WidgetKit / SwiftUI).
//
// Add this file to a new "Widget Extension" target named `VytaWidgets`
// (see WIDGETS.md). Both the app target and this widget target must share the
// App Group "group.app.vita.lifeos".
//
// • Water widget   — Small/Medium/Large + Lock-Screen circular. Quick-add a
//                    Glass (user's glass size) or 1 Litre. Reset is done in app.
// • Reminders/list — Small/Medium/Large + Lock-Screen rectangular, and it's
//                    CONFIGURABLE: choose Today · This week · To-Do list
//                    (long-press the widget → Edit Widget).
//
// Language follows the device (Italian / English).
//
// Shared data (src/platform/widget.ts):
//   key "vyta_widget"        → { water:{ml,goalMl,glassMl}, reminders:[...], tasks:[...] }
//   key "vyta_widget_inbox"  → accumulated ml logged from the widget button
// ============================================================================
import WidgetKit
import SwiftUI
import AppIntents

let APP_GROUP = "group.app.vita.lifeos"
let WIDGET_KEY = "vyta_widget"
let INBOX_KEY = "vyta_widget_inbox"

// MARK: - Localization

enum L {
    static var isIT: Bool { (Locale.current.language.languageCode?.identifier ?? "en") == "it" }
    static func t(_ it: String, _ en: String) -> String { isIT ? it : en }
}

func litersStr(_ ml: Int) -> String {
    let s = String(format: "%.1f", Double(ml) / 1000)
    return (L.isIT ? s.replacingOccurrences(of: ".", with: ",") : s) + "L"
}

func weekdayShort(_ iso: String) -> String {
    let f = DateFormatter(); f.dateFormat = "yyyy-MM-dd"
    guard let d = f.date(from: iso) else { return "" }
    let out = DateFormatter(); out.locale = Locale.current; out.dateFormat = "EEE"
    return out.string(from: d).capitalized
}
func withinDays(_ iso: String, _ days: Int) -> Bool {
    let f = DateFormatter(); f.dateFormat = "yyyy-MM-dd"
    guard let d = f.date(from: iso) else { return false }
    let diff = Calendar.current.dateComponents([.day], from: Calendar.current.startOfDay(for: Date()), to: d).day ?? 999
    return diff >= 0 && diff <= days
}

// MARK: - Shared data

struct WidgetReminder: Decodable, Hashable { let label: String; let time: String }
struct WidgetTask: Decodable, Hashable { let title: String; let due: String? }
struct WidgetWater: Decodable { let ml: Int; let goalMl: Int; let glassMl: Int? }
struct WidgetData: Decodable { let water: WidgetWater; let reminders: [WidgetReminder]; let tasks: [WidgetTask] }

func readWidgetData() -> WidgetData {
    let fallback = WidgetData(water: .init(ml: 0, goalMl: 2000, glassMl: 200), reminders: [], tasks: [])
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
            defaults.set(defaults.integer(forKey: INBOX_KEY) + ml, forKey: INBOX_KEY)
            if let raw = defaults.string(forKey: WIDGET_KEY),
               let d = raw.data(using: .utf8),
               var obj = try? JSONSerialization.jsonObject(with: d) as? [String: Any],
               var water = obj["water"] as? [String: Any],
               let cur = water["ml"] as? Int {
                water["ml"] = cur + ml
                obj["water"] = water
                if let out = try? JSONSerialization.data(withJSONObject: obj),
                   let s = String(data: out, encoding: .utf8) { defaults.set(s, forKey: WIDGET_KEY) }
            }
        }
        return .result()
    }
}

// MARK: - Configurable list mode (Today / Week / To-Do)

enum ListMode: String, AppEnum {
    case today, week, todo
    static var typeDisplayRepresentation: TypeDisplayRepresentation { "Vista" }
    static var caseDisplayRepresentations: [ListMode: DisplayRepresentation] {
        [
            .today: DisplayRepresentation(title: LocalizedStringResource(stringLiteral: L.t("Oggi", "Today"))),
            .week: DisplayRepresentation(title: LocalizedStringResource(stringLiteral: L.t("Settimana", "This week"))),
            .todo: DisplayRepresentation(title: LocalizedStringResource(stringLiteral: L.t("To-Do list", "To-Do list"))),
        ]
    }
}

struct ListConfigIntent: WidgetConfigurationIntent {
    static var title: LocalizedStringResource = "Vyta list"
    static var description = IntentDescription("Today · This week · To-Do")
    @Parameter(title: "Vista", default: .today) var mode: ListMode
}

// MARK: - Colors

let vGreen = Color(red: 0.086, green: 0.639, blue: 0.290)
let vBlue  = Color(red: 0.055, green: 0.647, blue: 0.914)
let vCream = Color(red: 0.973, green: 0.945, blue: 0.902)
let vInk   = Color(red: 0.165, green: 0.125, blue: 0.094)

// MARK: - Reusable bits

struct WaterRing: View {
    let progress: Double; let size: CGFloat
    var body: some View {
        ZStack {
            Circle().stroke(vBlue.opacity(0.18), lineWidth: size * 0.12)
            Circle().trim(from: 0, to: progress)
                .stroke(vBlue, style: StrokeStyle(lineWidth: size * 0.12, lineCap: .round))
                .rotationEffect(.degrees(-90))
            Image(systemName: "drop.fill").foregroundColor(vBlue).font(.system(size: size * 0.34))
        }.frame(width: size, height: size)
    }
}

@ViewBuilder
func addButton(_ ml: Int, _ label: String) -> some View {
    if #available(iOS 17.0, *) {
        Button(intent: LogWaterIntent(ml: ml)) {
            Label(label, systemImage: "plus").font(.caption).bold().frame(maxWidth: .infinity)
        }.tint(vBlue).buttonBorderShape(.capsule)
    }
}

func pill(_ text: String, _ color: Color) -> some View {
    Text(text).font(.caption2).bold().foregroundColor(color)
        .padding(.horizontal, 7).padding(.vertical, 3)
        .background(color.opacity(0.14)).clipShape(Capsule())
}

// MARK: - Water widget (Static)

struct WaterEntry: TimelineEntry { let date: Date; let data: WidgetData }
struct WaterProvider: TimelineProvider {
    func placeholder(in c: Context) -> WaterEntry { WaterEntry(date: Date(), data: readWidgetData()) }
    func getSnapshot(in c: Context, completion: @escaping (WaterEntry) -> Void) { completion(WaterEntry(date: Date(), data: readWidgetData())) }
    func getTimeline(in c: Context, completion: @escaping (Timeline<WaterEntry>) -> Void) {
        let next = Calendar.current.date(byAdding: .minute, value: 30, to: Date())!
        completion(Timeline(entries: [WaterEntry(date: Date(), data: readWidgetData())], policy: .after(next)))
    }
}

struct WaterWidgetView: View {
    @Environment(\.widgetFamily) var family
    let data: WidgetData
    var progress: Double { data.water.goalMl > 0 ? min(1, Double(data.water.ml) / Double(data.water.goalMl)) : 0 }
    var glass: Int { data.water.glassMl ?? 200 }
    var glassLabel: String { L.t("Bicchiere", "Glass") }
    var glasses: Int { max(1, data.water.goalMl / glass) }
    var done: Int { data.water.ml / glass }

    var header: some View {
        HStack(spacing: 5) {
            Image(systemName: "drop.fill").foregroundColor(vBlue)
            Text(L.t("Acqua", "Water")).font(.caption).bold().foregroundColor(.secondary)
            Spacer()
            Text("\(done)/\(glasses)").font(.caption).bold().foregroundColor(vBlue)
        }
    }

    // Grid of drops: filled = consumed, outline = remaining. Columns are
    // balanced so the drops sit symmetrically (e.g. 10 → 5×2, 16 → 8×2).
    func drops(maxCols: Int, cap: Int, size: CGFloat) -> some View {
        let shown = min(glasses, cap)
        let rows = max(1, Int(ceil(Double(shown) / Double(maxCols))))
        let cols = Int(ceil(Double(shown) / Double(rows)))
        return LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 6), count: cols), spacing: 6) {
            ForEach(0..<shown, id: \.self) { i in
                Image(systemName: i < done ? "drop.fill" : "drop")
                    .font(.system(size: size))
                    .foregroundColor(i < done ? vBlue : vBlue.opacity(0.35))
            }
        }
    }

    var body: some View {
        switch family {
        case .accessoryCircular:
            Gauge(value: progress) { Image(systemName: "drop.fill") }.gaugeStyle(.accessoryCircular)
        case .systemMedium:
            VStack(alignment: .leading, spacing: 8) {
                header
                drops(maxCols: 8, cap: 16, size: 18)
                Spacer(minLength: 2)
                HStack(spacing: 8) { addButton(glass, glassLabel); addButton(1000, "1 L") }
            }.padding()
        case .systemLarge:
            VStack(alignment: .leading, spacing: 12) {
                header
                Text("\(done) \(L.t("di", "of")) \(glasses)")
                    .font(.system(size: 22, weight: .heavy)).foregroundColor(vInk)
                drops(maxCols: 8, cap: 32, size: 24)
                Spacer()
                HStack(spacing: 10) { addButton(glass, glassLabel); addButton(1000, "1 L") }
            }.padding()
        default: // systemSmall
            VStack(alignment: .leading, spacing: 6) {
                header
                drops(maxCols: 4, cap: 8, size: 16)
                Spacer(minLength: 2)
                addButton(glass, glassLabel)
            }.padding()
        }
    }
}

struct WaterWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "VytaWaterWidget", provider: WaterProvider()) { entry in
            if #available(iOS 17.0, *) { WaterWidgetView(data: entry.data).containerBackground(vCream, for: .widget) }
            else { WaterWidgetView(data: entry.data).background(vCream) }
        }
        .configurationDisplayName(L.t("Vyta · Acqua", "Vyta · Water"))
        .description(L.t("Segna l’acqua di oggi.", "Log today’s water."))
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge, .accessoryCircular])
    }
}

// MARK: - Configurable list widget (Today / Week / To-Do)

struct ListEntry: TimelineEntry { let date: Date; let data: WidgetData; let mode: ListMode }

struct ListProvider: AppIntentTimelineProvider {
    func placeholder(in c: Context) -> ListEntry { ListEntry(date: Date(), data: readWidgetData(), mode: .today) }
    func snapshot(for config: ListConfigIntent, in c: Context) async -> ListEntry { ListEntry(date: Date(), data: readWidgetData(), mode: config.mode) }
    func timeline(for config: ListConfigIntent, in c: Context) async -> Timeline<ListEntry> {
        let next = Calendar.current.date(byAdding: .minute, value: 30, to: Date())!
        return Timeline(entries: [ListEntry(date: Date(), data: readWidgetData(), mode: config.mode)], policy: .after(next))
    }
}

struct ListWidgetView: View {
    @Environment(\.widgetFamily) var family
    let data: WidgetData
    let mode: ListMode

    var titleText: String {
        switch mode {
        case .today: return L.t("Promemoria", "Reminders")
        case .week: return L.t("Settimana", "This week")
        case .todo: return L.t("To-Do", "To-Do")
        }
    }
    var icon: String { mode == .todo ? "checklist" : (mode == .week ? "calendar" : "bell.fill") }

    var rowsCount: Int { family == .systemLarge ? 8 : (family == .systemMedium ? 4 : 3) }

    var header: some View {
        HStack(spacing: 5) {
            Image(systemName: icon).foregroundColor(vGreen)
            Text(titleText).font(.caption).bold().foregroundColor(.secondary); Spacer()
        }
    }

    func reminderRow(_ r: WidgetReminder) -> some View {
        HStack(spacing: 8) { pill(r.time, vGreen); Text(r.label).font(.caption).foregroundColor(vInk).lineLimit(1); Spacer() }
    }
    func taskRow(_ tk: WidgetTask, showDay: Bool) -> some View {
        HStack(spacing: 8) {
            Image(systemName: "circle").foregroundColor(vGreen).font(.caption)
            if showDay, let due = tk.due { pill(weekdayShort(due), vGreen) }
            Text(tk.title).font(.caption).foregroundColor(vInk).lineLimit(1); Spacer()
        }
    }

    @ViewBuilder var content: some View {
        switch mode {
        case .today:
            if data.reminders.isEmpty { emptyView(L.t("Nessun promemoria", "No reminders")) }
            else { ForEach(data.reminders.prefix(rowsCount), id: \.self) { reminderRow($0) }; Spacer() }
        case .week:
            let wk = data.tasks.filter { $0.due != nil && withinDays($0.due!, 7) }
            if wk.isEmpty { emptyView(L.t("Niente in settimana", "Nothing this week")) }
            else { ForEach(wk.prefix(rowsCount), id: \.self) { taskRow($0, showDay: true) }; Spacer() }
        case .todo:
            if data.tasks.isEmpty { emptyView(L.t("Tutto fatto!", "All done!")) }
            else { ForEach(data.tasks.prefix(rowsCount), id: \.self) { taskRow($0, showDay: false) }; Spacer() }
        }
    }

    func emptyView(_ s: String) -> some View {
        VStack { Spacer(); Text(s).font(.subheadline).foregroundColor(.secondary); Spacer() }
    }

    var body: some View {
        if family == .accessoryRectangular {
            VStack(alignment: .leading, spacing: 2) {
                Text(titleText).font(.caption2).bold()
                if mode == .today {
                    ForEach(data.reminders.prefix(2), id: \.self) { Text("\($0.time)  \($0.label)").font(.caption2).lineLimit(1) }
                } else {
                    ForEach(data.tasks.prefix(2), id: \.self) { Text("• \($0.title)").font(.caption2).lineLimit(1) }
                }
            }
        } else {
            VStack(alignment: .leading, spacing: family == .systemSmall ? 5 : 8) { header; content }.padding()
        }
    }
}

struct ListWidget: Widget {
    var body: some WidgetConfiguration {
        AppIntentConfiguration(kind: "VytaListWidget", intent: ListConfigIntent.self, provider: ListProvider()) { entry in
            if #available(iOS 17.0, *) { ListWidgetView(data: entry.data, mode: entry.mode).containerBackground(vCream, for: .widget) }
            else { ListWidgetView(data: entry.data, mode: entry.mode).background(vCream) }
        }
        .configurationDisplayName(L.t("Vyta · Lista", "Vyta · List"))
        .description(L.t("Oggi, settimana o to-do.", "Today, week or to-do."))
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge, .accessoryRectangular])
    }
}

// MARK: - Bundle

@main
struct VytaWidgets: WidgetBundle {
    var body: some Widget {
        WaterWidget()
        ListWidget()
    }
}
