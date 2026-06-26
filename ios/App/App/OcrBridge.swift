import Foundation
import Capacitor
import Vision
import UIKit

/// On-device OCR via Apple's Vision framework — fully offline, no network, no
/// data leaves the phone. Reads text lines from a (base64 data-URL) image so the
/// web layer can parse a photographed workout plan into exercises.
@objc(OcrBridge)
public class OcrBridge: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "OcrBridge"
    public let jsName = "OcrBridge"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "recognize", returnType: CAPPluginReturnPromise),
    ]

    @objc func recognize(_ call: CAPPluginCall) {
        guard let dataUrl = call.getString("image") else {
            call.reject("image is required")
            return
        }
        let base64 = dataUrl.contains(",") ? String(dataUrl.split(separator: ",").last ?? "") : dataUrl
        guard let data = Data(base64Encoded: base64),
              let uiImage = UIImage(data: data),
              let cgImage = uiImage.cgImage else {
            call.reject("invalid image")
            return
        }

        let request = VNRecognizeTextRequest { (req, err) in
            if let err = err {
                call.reject(err.localizedDescription)
                return
            }
            let observations = (req.results as? [VNRecognizedTextObservation]) ?? []
            let lines = observations.compactMap { $0.topCandidates(1).first?.string }
            call.resolve(["lines": lines])
        }
        request.recognitionLevel = .accurate
        request.usesLanguageCorrection = true

        let handler = VNImageRequestHandler(cgImage: cgImage, options: [:])
        DispatchQueue.global(qos: .userInitiated).async {
            do {
                try handler.perform([request])
            } catch {
                call.reject(error.localizedDescription)
            }
        }
    }
}
