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
struct WidgetHabit: Decodable, Hashable { let name: String; let color: String; let week: [Int]; let heat: [Int] }
struct WidgetMomentum: Decodable { let score: Int; let message: String }
struct WidgetData: Decodable { let water: WidgetWater; let reminders: [WidgetReminder]; let tasks: [WidgetTask]; let habits: [WidgetHabit]; let momentum: WidgetMomentum? }

/** Parse a #rrggbb hex into a SwiftUI Color (falls back to green). */
func hexColor(_ hex: String) -> Color {
    var s = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
    if s.hasPrefix("#") { s.removeFirst() }
    guard s.count == 6, let v = Int(s, radix: 16) else { return vGreen }
    return Color(red: Double((v >> 16) & 0xff) / 255, green: Double((v >> 8) & 0xff) / 255, blue: Double(v & 0xff) / 255)
}

func readWidgetData() -> WidgetData {
    let fallback = WidgetData(water: .init(ml: 0, goalMl: 2000, glassMl: 200), reminders: [], tasks: [], habits: [], momentum: nil)
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

// AppEnum titles must be compile-time string literals (the AppEnum macro can't
// read runtime values), so the picker labels are bilingual literals.
enum ListMode: String, AppEnum {
    case today, week, todo
    static var typeDisplayRepresentation: TypeDisplayRepresentation { "Vista" }
    static var caseDisplayRepresentations: [ListMode: DisplayRepresentation] = [
        .today: "Oggi · Today",
        .week:  "Settimana · This week",
        .todo:  "To-Do",
    ]
}

struct ListConfigIntent: WidgetConfigurationIntent {
    static var title: LocalizedStringResource = "Vyta list"
    static var description = IntentDescription("Today · This week · To-Do")
    @Parameter(title: "Vista", default: .today) var mode: ListMode
}

// MARK: - Colors

// Luxury dark palette — matches the app token layer (src/styles/index.css).
let vGreen = Color(red: 0.239, green: 0.651, blue: 0.435) // #3DA66F refined emerald
let vGreenDeep = Color(red: 0.051, green: 0.302, blue: 0.196) // #0D4D32 deep emerald
let vGold  = Color(red: 0.722, green: 0.525, blue: 0.043) // #B8860B antique gold
let vBlue  = Color(red: 0.176, green: 0.831, blue: 0.969) // #2DD4F7 water cyan
let vBg    = Color(red: 0.075, green: 0.090, blue: 0.114) // #13171D card surface
let vInk   = Color(red: 0.925, green: 0.937, blue: 0.941) // #ECEFF0 light editorial ink
let vInk2  = Color(red: 0.651, green: 0.694, blue: 0.675) // #A6B1AC muted ink

// Widget background: a soft emerald wash up top fading into anthracite, echoing
// the app's home hero gradient.
let vBgGradient = RadialGradient(
    gradient: Gradient(colors: [Color(red: 0.071, green: 0.220, blue: 0.149), vBg]),
    center: UnitPoint(x: 0.5, y: -0.10), startRadius: 6, endRadius: 240)

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
            Text(L.t("Acqua", "Water")).font(.caption).bold().foregroundColor(vInk2)
            Spacer()
            Text("\(done)/\(glasses)").font(.caption).bold().foregroundColor(vBlue)
        }
    }

    // One drop cell. Filled = consumed; empty = a "+" button that logs a glass
    // (interactive, iOS 17+), so the widget is actually useful.
    @ViewBuilder
    func dropCell(_ i: Int, size: CGFloat, interactive: Bool) -> some View {
        if i < done {
            Image(systemName: "drop.fill").font(.system(size: size)).foregroundColor(vBlue)
        } else if interactive, #available(iOS 17.0, *) {
            Button(intent: LogWaterIntent(ml: glass)) {
                ZStack {
                    Image(systemName: "drop").font(.system(size: size)).foregroundColor(vBlue.opacity(0.4))
                    Image(systemName: "plus").font(.system(size: size * 0.42, weight: .bold)).foregroundColor(vBlue)
                }
            }.buttonStyle(.plain)
        } else {
            Image(systemName: "drop").font(.system(size: size)).foregroundColor(vBlue.opacity(0.35))
        }
    }

    // Balanced columns so drops sit symmetrically (e.g. 10 → 5×2, 16 → 8×2).
    func drops(maxCols: Int, cap: Int, size: CGFloat, interactive: Bool) -> some View {
        let shown = min(glasses, cap)
        let rows = max(1, Int(ceil(Double(shown) / Double(maxCols))))
        let cols = Int(ceil(Double(shown) / Double(rows)))
        return LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 6), count: cols), spacing: 6) {
            ForEach(0..<shown, id: \.self) { i in dropCell(i, size: size, interactive: interactive) }
        }
    }

    var body: some View {
        switch family {
        case .accessoryCircular:
            Gauge(value: progress) { Image(systemName: "drop.fill") }.gaugeStyle(.accessoryCircular)
        case .systemMedium:
            VStack(alignment: .leading, spacing: 8) {
                header
                drops(maxCols: 8, cap: 16, size: 18, interactive: true)
                Spacer(minLength: 2)
                addButton(1000, "1 L")
            }.padding()
        case .systemLarge:
            VStack(alignment: .leading, spacing: 12) {
                header
                Text("\(done) \(L.t("di", "of")) \(glasses)")
                    .font(.system(size: 22, weight: .heavy)).foregroundColor(vInk)
                drops(maxCols: 8, cap: 32, size: 26, interactive: true)
                Spacer()
                addButton(1000, "1 L")
            }.padding()
        default: // systemSmall
            VStack(alignment: .leading, spacing: 6) {
                header
                drops(maxCols: 4, cap: 8, size: 16, interactive: false)
                Spacer(minLength: 2)
                addButton(glass, glassLabel)
            }.padding()
        }
    }
}

struct WaterWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "VytaWaterWidget", provider: WaterProvider()) { entry in
            if #available(iOS 17.0, *) { WaterWidgetView(data: entry.data).containerBackground(vBgGradient, for: .widget) }
            else { WaterWidgetView(data: entry.data).background(vBgGradient) }
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
            Text(titleText).font(.caption).bold().foregroundColor(vInk2); Spacer()
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
        VStack { Spacer(); Text(s).font(.subheadline).foregroundColor(vInk2); Spacer() }
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
            if #available(iOS 17.0, *) { ListWidgetView(data: entry.data, mode: entry.mode).containerBackground(vBgGradient, for: .widget) }
            else { ListWidgetView(data: entry.data, mode: entry.mode).background(vBgGradient) }
        }
        .configurationDisplayName(L.t("Vyta · Lista", "Vyta · List"))
        .description(L.t("Oggi, settimana o to-do.", "Today, week or to-do."))
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge, .accessoryRectangular])
    }
}

// MARK: - Habit widgets (heatmap + weekly tracker)

struct HabitsEntry: TimelineEntry { let date: Date; let data: WidgetData }
struct HabitsProvider: TimelineProvider {
    func placeholder(in c: Context) -> HabitsEntry { HabitsEntry(date: Date(), data: readWidgetData()) }
    func getSnapshot(in c: Context, completion: @escaping (HabitsEntry) -> Void) { completion(HabitsEntry(date: Date(), data: readWidgetData())) }
    func getTimeline(in c: Context, completion: @escaping (Timeline<HabitsEntry>) -> Void) {
        let next = Calendar.current.date(byAdding: .minute, value: 30, to: Date())!
        completion(Timeline(entries: [HabitsEntry(date: Date(), data: readWidgetData())], policy: .after(next)))
    }
}

// Monday-first localized weekday letters (e.g. M T W T F S S).
func weekdayLetters() -> [String] {
    let sym = Calendar.current.veryShortWeekdaySymbols // [S,M,T,W,T,F,S]
    return Array(sym[1...6]) + [sym[0]]
}
// "9 – 15 Mar" for the current week.
func currentWeekRange() -> String {
    let cal = Calendar.current
    let today = cal.startOfDay(for: Date())
    let weekday = cal.component(.weekday, from: today) // 1 = Sun
    let monday = cal.date(byAdding: .day, value: -((weekday + 5) % 7), to: today)!
    let sunday = cal.date(byAdding: .day, value: 6, to: monday)!
    let f = DateFormatter(); f.locale = Locale.current
    f.dateFormat = "d"; let a = f.string(from: monday)
    f.dateFormat = "d MMM"; let b = f.string(from: sunday)
    return "\(a) – \(b)"
}

func heatColor(_ s: Int, _ c: Color) -> Color {
    s == 2 ? c : (s == 1 ? c.opacity(0.30) : Color.white.opacity(0.08))
}

struct HabitsWidgetView: View {
    @Environment(\.widgetFamily) var family
    let data: WidgetData

    var emptyText: String { L.t("Nessuna abitudine", "No habits") }

    // GitHub-style heatmap for one habit (49 days → 7×7).
    func heatmap(_ h: WidgetHabit, cell: CGFloat) -> some View {
        let c = hexColor(h.color)
        let weeks = stride(from: 0, to: h.heat.count, by: 7).map { Array(h.heat[$0..<min($0 + 7, h.heat.count)]) }
        return HStack(spacing: 3) {
            ForEach(Array(weeks.enumerated()), id: \.offset) { _, wk in
                VStack(spacing: 3) {
                    ForEach(Array(wk.enumerated()), id: \.offset) { _, s in
                        RoundedRectangle(cornerRadius: 2).fill(heatColor(s, c)).frame(width: cell, height: cell)
                    }
                }
            }
        }
    }

    func dayCircle(_ s: Int, _ c: Color) -> some View {
        ZStack {
            Circle().fill(s == 2 ? c : (s == 1 ? c.opacity(0.20) : Color.white.opacity(0.07)))
            if s == 2 { Image(systemName: "checkmark").font(.system(size: 9, weight: .bold)).foregroundColor(.white) }
        }.frame(width: 22, height: 22)
    }

    var tracker: some View {
        let nameW: CGFloat = 92
        let rows = family == .systemLarge ? 6 : 4
        return VStack(spacing: 8) {
            HStack(spacing: 0) {
                Text(currentWeekRange()).font(.caption2).bold().foregroundColor(vInk2).frame(width: nameW, alignment: .leading)
                ForEach(Array(weekdayLetters().enumerated()), id: \.offset) { _, d in
                    Text(d).font(.system(size: 10, weight: .bold)).foregroundColor(vInk2).frame(maxWidth: .infinity)
                }
            }
            ForEach(Array(data.habits.prefix(rows).enumerated()), id: \.offset) { _, h in
                HStack(spacing: 0) {
                    HStack(spacing: 6) {
                        Circle().fill(hexColor(h.color)).frame(width: 8, height: 8)
                        Text(h.name).font(.caption).foregroundColor(vInk).lineLimit(1)
                        Spacer(minLength: 0)
                    }.frame(width: nameW, alignment: .leading)
                    ForEach(0..<7, id: \.self) { i in
                        dayCircle(i < h.week.count ? h.week[i] : 0, hexColor(h.color)).frame(maxWidth: .infinity)
                    }
                }
            }
        }
    }

    var body: some View {
        if data.habits.isEmpty {
            VStack { Spacer(); Text(emptyText).font(.subheadline).foregroundColor(vInk2); Spacer() }
        } else if family == .systemSmall {
            let h = data.habits[0]
            VStack(alignment: .leading, spacing: 8) {
                HStack(spacing: 5) {
                    Circle().fill(hexColor(h.color)).frame(width: 9, height: 9)
                    Text(h.name).font(.caption).bold().foregroundColor(vInk).lineLimit(1); Spacer()
                }
                heatmap(h, cell: 11)
            }.padding()
        } else {
            tracker.padding()
        }
    }
}

struct HabitsWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "VytaHabitsWidget", provider: HabitsProvider()) { entry in
            if #available(iOS 17.0, *) { HabitsWidgetView(data: entry.data).containerBackground(vBgGradient, for: .widget) }
            else { HabitsWidgetView(data: entry.data).background(vBgGradient) }
        }
        .configurationDisplayName(L.t("Vyta · Abitudini", "Vyta · Habits"))
        .description(L.t("Heatmap e tracker settimanale.", "Heatmap and weekly tracker."))
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
    }
}

// MARK: - Momentum widget (daily cross-life score)

struct MomentumEntry: TimelineEntry { let date: Date; let data: WidgetData }
struct MomentumProvider: TimelineProvider {
    func placeholder(in c: Context) -> MomentumEntry { MomentumEntry(date: Date(), data: readWidgetData()) }
    func getSnapshot(in c: Context, completion: @escaping (MomentumEntry) -> Void) { completion(MomentumEntry(date: Date(), data: readWidgetData())) }
    func getTimeline(in c: Context, completion: @escaping (Timeline<MomentumEntry>) -> Void) {
        let next = Calendar.current.date(byAdding: .minute, value: 30, to: Date())!
        completion(Timeline(entries: [MomentumEntry(date: Date(), data: readWidgetData())], policy: .after(next)))
    }
}

struct MomentumWidgetView: View {
    @Environment(\.widgetFamily) var family
    let data: WidgetData
    var score: Int { data.momentum?.score ?? 0 }
    var message: String { data.momentum?.message ?? L.t("Pianta il primo seme di oggi 🌱", "Plant your first seed today 🌱") }
    var progress: Double { min(1, Double(score) / 100) }

    func ring(_ size: CGFloat) -> some View {
        ZStack {
            Circle().stroke(vGold.opacity(0.22), lineWidth: 1) // antique-gold hairline (app momentum card)
            Circle().stroke(vGreen.opacity(0.16), lineWidth: size * 0.11)
            Circle().trim(from: 0, to: progress)
                .stroke(LinearGradient(colors: [vGreen, vGreenDeep], startPoint: .topLeading, endPoint: .bottomTrailing),
                        style: StrokeStyle(lineWidth: size * 0.11, lineCap: .round))
                .rotationEffect(.degrees(-90))
            VStack(spacing: 0) {
                Text("\(score)").font(.system(size: size * 0.34, weight: .heavy)).foregroundColor(vInk)
                Text("/100").font(.system(size: size * 0.12, weight: .bold)).foregroundColor(vInk2)
            }
        }.frame(width: size, height: size)
    }

    var header: some View {
        HStack(spacing: 5) {
            Image(systemName: "leaf.fill").foregroundColor(vGreen)
            Text("Momentum").font(.caption).bold().foregroundColor(vInk2); Spacer()
        }
    }

    var body: some View {
        switch family {
        case .accessoryCircular:
            Gauge(value: progress) { Image(systemName: "leaf.fill") } currentValueLabel: { Text("\(score)") }
                .gaugeStyle(.accessoryCircular)
        case .systemMedium:
            HStack(spacing: 16) {
                ring(96)
                VStack(alignment: .leading, spacing: 6) {
                    Text("Momentum").font(.caption).bold().foregroundColor(vInk2)
                    Text(message).font(.system(size: 15, weight: .semibold)).foregroundColor(vInk).lineLimit(3)
                }
                Spacer(minLength: 0)
            }.padding()
        default: // systemSmall
            VStack(alignment: .leading, spacing: 8) {
                header
                HStack { Spacer(); ring(78); Spacer() }
                Spacer(minLength: 0)
            }.padding()
        }
    }
}

struct MomentumWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "VytaMomentumWidget", provider: MomentumProvider()) { entry in
            if #available(iOS 17.0, *) { MomentumWidgetView(data: entry.data).containerBackground(vBgGradient, for: .widget) }
            else { MomentumWidgetView(data: entry.data).background(vBgGradient) }
        }
        .configurationDisplayName(L.t("Vyta · Momentum", "Vyta · Momentum"))
        .description(L.t("Il tuo punteggio di oggi.", "Your daily score."))
        .supportedFamilies([.systemSmall, .systemMedium, .accessoryCircular])
    }
}

// MARK: - Bundle

@main
struct VytaWidgets: WidgetBundle {
    var body: some Widget {
        MomentumWidget()
        WaterWidget()
        ListWidget()
        HabitsWidget()
    }
}
