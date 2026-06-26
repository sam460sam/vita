# Geode — App Store Submission Pack

Everything you need to submit **Geode: Crystal & Rock ID** to the App Store.
Replace the bracketed placeholders (`[…]`) with your details before publishing.

- **App name:** Geode: Crystal & Rock ID
- **Subtitle:** Identify crystals, rocks & gems
- **Bundle ID:** `com.[yourdev].geode`
- **Category:** Primary — *Reference*; Secondary — *Education*
- **Age rating:** **4+**
- **Support email:** `hello@[yourdomain]`
- **AI provider (disclosed):** Google Gemini

---

## 1. App Store description

**Promo text (≤170 chars)**
> Point your camera at any crystal, rock or gem and get an honest AI
> identification — with confidence scores, care tips and a collection you keep.

**Description**
```
Geode is the honest way to identify crystals, rocks, minerals and gemstones.
Point your camera, and Geode shows you the most likely matches — with real
confidence scores instead of one over-confident guess.

POINT → IDENTIFY → COLLECT
• Snap a photo of any crystal, rock, mineral or gem.
• See up to 3 candidates ranked by confidence (e.g. Amethyst 82%).
• Get the common + scientific name, Mohs hardness, a factual description,
  care & cleaning tips, traditional folklore and an indicative value range.

REFINE FOR A BETTER ANSWER
Not sure? Geode asks a couple of quick physical-test questions (streak colour,
magnetism, hardness, transparency) and sharpens the identification — just like
a real rockhound would.

YOUR OFFLINE COLLECTION
Save your finds to a beautiful collection that works fully offline. Add notes,
the location you found it, and tags. Search and browse anytime. Your collection
lives only on your device.

STONE OF THE DAY
A new crystal and fascinating fact every day — a pocket guide that keeps giving,
even offline.

HONEST BY DESIGN
Identification is an AI estimate and can be wrong. Geode is upfront about
uncertainty and never gives medical, safety or investment advice. Folklore is
clearly labelled as tradition, not health advice.

Geode Pro unlocks unlimited identifications, unlimited refine, full meanings &
value estimates, and collection export.
```

**Keywords (100-char field)**
```
crystal identifier,rock identifier,gem identifier,mineral identifier,what crystal,gemstone,stone id,rockhound,geology
```

**What's New (v1.0.0)**
```
The first release of Geode. Identify crystals, rocks and gems with honest
confidence scores, refine results with quick physical tests, and build your own
offline collection. We'd love your feedback!
```

---

## 2. Privacy — App Store Connect answers

**Position: “Data Not Collected.”**

- No account, no login, no analytics SDK, no advertising identifier.
- Photos are sent to **Google Gemini** (via our Cloudflare Worker) **only** to
  perform the identification and are **not stored on our servers**.
- The collection (saved stones, notes, photos) is stored **only on the device**
  (IndexedDB).
- Purchases are handled by Apple / RevenueCat (RevenueCat may process a random
  app-user ID and purchase receipts to manage your subscription; this is not
  linked to your identity by us).

In the App Privacy questionnaire, answer **“No, we do not collect data from this
app”** for the app's own data. (RevenueCat and Apple disclose their own
purchase-data handling; include RevenueCat's privacy details if prompted by your
own legal review.)

**Privacy Manifest:** `ios-native/PrivacyInfo.xcprivacy` declares
`NSPrivacyTracking = false`, no collected data types, and required-reason API
usage (UserDefaults, file timestamp, disk space). Every third-party SDK
(RevenueCat + Capacitor plugins) ships its own manifest — keep them.

---

## 3. Privacy Policy (host this; set as `privacyUrl`)

```
PRIVACY POLICY — Geode
Last updated: [DATE]

Geode ("we", "us") is a crystal, rock, mineral and gemstone identification app.
We designed Geode to collect as little as possible.

1. NO ACCOUNT, NO PERSONAL DATA
Geode does not require an account or login. We do not ask for your name, email,
or any personal identifier, and we do not track you across apps or websites.

2. PHOTOS YOU IDENTIFY
When you identify a stone, your photo is sent to our processing proxy and then
to our AI provider, Google Gemini, solely to produce an identification. We do
NOT store your photos on our servers, and we do not use them to train models.
The photo is processed and discarded. Any photo you choose to SAVE is stored
only on your device, as part of your collection.

3. YOUR COLLECTION
Saved stones, photos, notes, locations and tags are stored locally on your
device (on-device database) and are not uploaded to us. You can export or delete
them at any time in the app.

4. PURCHASES
Subscriptions and purchases are processed by Apple and managed via RevenueCat.
We receive anonymous purchase status (whether you have an active subscription)
to unlock Pro features. We do not receive your payment details. See Apple's and
RevenueCat's privacy policies for their processing.

5. NOTIFICATIONS
If you opt in, Geode schedules local reminders on your device. These are local
notifications only; no data leaves your device for this.

6. CHILDREN
Geode is rated 4+ and does not knowingly collect any personal data from anyone,
including children.

7. THIRD PARTIES
- Google Gemini (AI identification): receives the photo to analyze; see Google's
  privacy policy.
- RevenueCat / Apple (purchases): manage your subscription.
- Cloudflare (our proxy host): processes requests in transit.

8. SECURITY
Requests are sent over HTTPS. Our AI provider key is held server-side and never
shipped in the app.

9. YOUR RIGHTS
Because we don't hold personal data about you, there's nothing for us to export
or delete on our side. Your on-device data is under your control in the app.

10. CHANGES
We'll update this page and the "Last updated" date if this policy changes.

11. CONTACT
Questions? Email hello@[yourdomain].
```

---

## 4. Terms of Use / EULA (host this; set as `termsUrl`)

You may use Apple's **standard EULA**
(https://www.apple.com/legal/internet-services/itunes/dev/stdeula/) — link it as
your Terms of Use. If you prefer your own, host the text below.

```
TERMS OF USE (EULA) — Geode
Last updated: [DATE]

1. ACCEPTANCE
By downloading or using Geode you agree to these Terms and to Apple's standard
Licensed Application End User License Agreement (EULA), which is incorporated by
reference: https://www.apple.com/legal/internet-services/itunes/dev/stdeula/

2. WHAT GEODE IS — AND ISN'T
Geode provides AI-generated identifications of crystals, rocks, minerals and
gemstones for general informational and educational purposes only.
Identifications are ESTIMATES and may be inaccurate. Geode is NOT a substitute
for a professional gemologist, mineralogist or appraiser. Do not rely on Geode
for safety, medical, financial, or high-value buying/selling decisions.

3. NO HEALTH OR INVESTMENT ADVICE
Any "traditional meanings" or folklore shown are cultural tradition only and are
NOT medical, health, or psychological advice. Value ranges are rough estimates,
not appraisals or investment advice.

4. SUBSCRIPTIONS (AUTO-RENEWABLE)
Geode offers auto-renewable subscriptions (Weekly and Annual) and an optional
one-time Lifetime purchase. Payment is charged to your Apple ID at confirmation
of purchase. Subscriptions automatically renew unless auto-renew is turned off
at least 24 hours before the end of the current period. Your account is charged
for renewal within 24 hours prior to the end of the current period. You can
manage or cancel subscriptions in your Apple ID Account Settings after purchase.
Any unused portion of a free trial is forfeited when you purchase a subscription.

5. ACCEPTABLE USE
Don't misuse the service, attempt to extract our keys, or abuse the identifier
to incur runaway costs. We may rate-limit or block abusive usage.

6. DISCLAIMER & LIABILITY
The app is provided "as is" without warranties. To the maximum extent permitted
by law, we are not liable for any damages arising from reliance on an
identification or value estimate.

7. CHANGES & CONTACT
We may update these Terms. Continued use means acceptance. Contact:
hello@[yourdomain].
```

> Add the EULA URL and Privacy URL in **App Store Connect ▸ App Information**
> and **App Privacy**. Both links are also shown **inside the paywall** and in
> **Settings**.

---

## 5. Reviewer notes (paste into App Review Information ▸ Notes)

```
Thanks for reviewing Geode!

WHAT IT DOES
Geode identifies crystals, rocks, minerals and gemstones from a photo. The photo
is sent to our Cloudflare Worker proxy, which calls Google Gemini (vision) and
returns up to 3 ranked candidates. We disclose this AI use explicitly.

AI CONSENT SCREEN (Apple Nov 2025 requirement)
Before the FIRST scan, the app shows a consent screen naming the AI provider
(Google Gemini) and stating we don't store photos on our servers. The user must
tap "Accept & continue" to proceed. (To see it again, delete & reinstall, or
clear app data.)

NO ACCOUNT REQUIRED
There is no login. Nothing is gated behind sign-in.

HOW TO TEST IDENTIFICATION
Point the camera at any crystal/rock, or pick a photo from the library. A clear,
well-lit photo of a single stone works best.

HOW TO TEST THE PAYWALL / IAP
- The app includes 2 free scans so you can experience the core feature first.
- After the free scans, the paywall appears; it's also reachable anytime via
  "Unlock Pro" on the Home screen and in Settings.
- Please use a Sandbox Apple ID to test the subscriptions (geode_weekly with a
  3-day trial, geode_annual, optional geode_lifetime). "Restore purchases" is on
  the paywall and in Settings.

PRIVACY
Position is "Data Not Collected". Photos are processed for identification and not
stored on our servers; the collection is stored only on-device.

Contact for any questions: hello@[yourdomain].
```

---

## 6. §3.1.2 paywall compliance checklist

The paywall (`src/features/paywall/Paywall.tsx`) is built to pass App Store
2026 review. Verify each before submitting:

- [x] **Charged price is the most prominent element** (largest, highest-contrast
      text per plan card). Per-day / per-week helpers and the trial line are
      smaller and below it.
- [x] **No toggle that hides the free trial by default.** The trial is stated in
      plain text on the Weekly card; there is no on/off switch.
- [x] **Honest copy:** e.g. "3 days free, then $4.99/week. Auto-renews until you
      cancel." Nothing that charges is labelled "free".
- [x] **Neutral CTA** — the button says **"Continue"**, not "Start free trial".
- [x] **Terms of Use (EULA), Privacy Policy and Restore Purchases are all
      visible on the paywall.**
- [x] **Standard auto-renew disclosure** is shown above the CTA.
- [x] **No manipulative re-prompts:** closing the paywall shows at most ONE
      honest fallback (nudges the same Annual plan), then closes.
- [x] **Paywall reachable from an explicit "Unlock Pro" button** (Home +
      Settings) so the reviewer finds it easily.
- [ ] In **App Store Connect**: EULA URL + Privacy Policy URL set; all 3 products
      created with correct prices; 3-day trial added to `geode_weekly`.

## 7. Age-rating questionnaire (new tiers)

Geode contains no objectionable content. Answer **None / No** to all content
categories (violence, sexual content, profanity, gambling, etc.). There is no
unrestricted web access and no user-generated content shared between users.
Result: **4+**.

## 8. Pre-submission checklist

- [ ] Worker deployed; `AI_API_KEY` set; `proxyUrl` updated.
- [ ] RevenueCat public key in `config.ts`; `pro` entitlement + 3 products live.
- [ ] Privacy Policy + EULA hosted; URLs in `config.ts` AND App Store Connect.
- [ ] `PrivacyInfo.xcprivacy` added to the App target.
- [ ] Camera + photo usage strings and `geode` URL scheme in Info.plist.
- [ ] App Intent + Widget added (`ios-native/README.md`).
- [ ] Icons/splash generated (`npm run assets && npx @capacitor/assets generate --ios`).
- [ ] Screenshots captured (6.7", 6.5", 5.5", iPad if supported).
- [ ] Built with Xcode 26 / iOS 26 SDK, deployment target iOS 16+.
- [ ] Archive → upload → submit with the reviewer notes above.
```
