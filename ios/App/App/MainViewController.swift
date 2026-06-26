import UIKit
import Capacitor

/// Custom Capacitor bridge controller used as the app's entry view controller
/// (set in Main.storyboard). Capacitor only auto-registers plugins that ship as
/// packages, so our in-app `WidgetBridge` plugin must be registered by hand here
/// — otherwise calls to it fail and the widgets never receive any data.
class MainViewController: CAPBridgeViewController {
    override open func capacitorDidLoad() {
        bridge?.registerPluginInstance(WidgetBridge())
        bridge?.registerPluginInstance(OcrBridge())
    }
}
