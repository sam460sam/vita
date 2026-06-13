# WalkBid — App Privacy (App Store Connect answers)

WalkBid is local-only. Answer the App Privacy questionnaire as **“Data Not
Collected.”**

## Data collection: NO
WalkBid does not collect any data. All records (clients, jobs, estimates,
contracts, signatures, photos, PDFs, logs, payments) are stored **only on the
device** in IndexedDB and the file system. None of it is transmitted to the
developer or any third party.

When the user taps **Share**, iOS hands a file or message to a recipient the
user chooses (Messages, Mail, etc.) — that is user-initiated sharing, not
collection by the app.

## Optional “Live” AI mode (off by default)
The default AI mode is **on-device** and makes no network calls. If — and only
if — the user switches AI to **Live** and configures their own proxy URL, the
transcript and price book for that one request are sent to the user’s own
serverless endpoint and on to Anthropic to generate a draft.

- This is user-configured, opt-in, and not the default.
- WalkBid (the developer) operates no server and receives nothing.
- If you ship with Live enabled or pre-configured, disclose “Other Data /
  User Content” used for **App Functionality**, not linked to identity, not
  used for tracking. With the default on-device mode, **Data Not Collected**
  is accurate.

## Tracking: NO
No analytics, no ads, no third-party SDKs, no IDFA, no `App Tracking
Transparency` prompt needed.

## Permissions (purpose strings live in Info.plist)
Each is requested **in context**, never at launch, and the app degrades
gracefully if denied:

| Permission | Why | Key |
|---|---|---|
| Camera | Attach geotagged jobsite photos | `NSCameraUsageDescription` |
| Microphone | Hands-free voice estimates/logs | `NSMicrophoneUsageDescription` |
| Speech recognition | Turn speech into text | `NSSpeechRecognitionUsageDescription` |
| Location (when in use) | Stamp where a doc was signed / photo taken | `NSLocationWhenInUseUsageDescription` |
| Photo library | Attach existing photos / save files | `NSPhotoLibrary(Add)UsageDescription` |

## Account / sign-in
None. No account, no login, no email capture.

## Data deletion
The user controls all data on-device: clear it, or export/import a backup zip.
Deleting the app removes all data.
