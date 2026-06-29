import Foundation
import Capacitor

/// Writes/reads the widget payload into the SHARED App Group so the WidgetKit
/// extension can read it. This is required because @capacitor/preferences (v8)
/// does NOT use a UserDefaults suite for its `group` option — it writes to
/// UserDefaults.standard with a prefixed key, which the widget extension cannot
/// see. This bridge writes the raw key into UserDefaults(suiteName:) instead.
@objc(WidgetBridge)
public class WidgetBridge: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "WidgetBridge"
    public let jsName = "WidgetBridge"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "set", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "get", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "remove", returnType: CAPPluginReturnPromise),
    ]

    private let suiteName = "group.app.vita.lifeos"

    @objc func set(_ call: CAPPluginCall) {
        guard let key = call.getString("key"), let value = call.getString("value") else {
            call.reject("key and value are required")
            return
        }
        UserDefaults(suiteName: suiteName)?.set(value, forKey: key)
        call.resolve()
    }

    @objc func get(_ call: CAPPluginCall) {
        guard let key = call.getString("key") else {
            call.reject("key is required")
            return
        }
        let value = UserDefaults(suiteName: suiteName)?.string(forKey: key)
        call.resolve(["value": value as Any])
    }

    @objc func remove(_ call: CAPPluginCall) {
        guard let key = call.getString("key") else {
            call.reject("key is required")
            return
        }
        UserDefaults(suiteName: suiteName)?.removeObject(forKey: key)
        call.resolve()
    }
}
