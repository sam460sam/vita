# WalkBid — App Store submission guide

End-to-end steps to ship v1.0 to the **US** App Store. Requires macOS + Xcode +
an Apple Developer Program membership ($99/yr).

## 0. One-time setup
1. Enroll in the Apple Developer Program.
2. In **App Store Connect → Apps → +** create a new app:
   - Platform: iOS · Name: **WalkBid** · Primary language: English (U.S.)
   - Bundle ID: **com.walkbid.app** (register it under Certificates,
     Identifiers & Profiles first if needed)
   - SKU: `walkbid-001`
3. **Availability** → select **United States only**.

## 1. Build the app
```bash
cd walkbid
npm install
npm run build
npx cap sync ios
npx cap open ios
```

## 2. Configure signing (Xcode)
- Select the **App** target → Signing & Capabilities → check **Automatically
  manage signing** → choose your Team.
- Confirm Bundle Identifier is `com.walkbid.app`.
- Set **Version** 1.0 and **Build** 1 (General tab / `MARKETING_VERSION`,
  `CURRENT_PROJECT_VERSION`).

## 3. Icons, splash, permissions (already done)
- App icon: `ios/.../AppIcon-512@2x.png` (regenerate: `node scripts/make-icon.mjs`).
- Dark-only, portrait, asphalt launch screen.
- Permission strings + `ITSAppUsesNonExemptEncryption=false` in `Info.plist`.
- (Optional) Enable on-device speech on iOS — see `docs/NATIVE.md`.

## 4. Archive & upload
- Xcode → device target **Any iOS Device (arm64)** → **Product → Archive**.
- In the Organizer: **Distribute App → App Store Connect → Upload**.
- Wait for processing in App Store Connect (TestFlight tab).

## 5. Store listing
Fill from `store/LISTING.md`:
- Name, Subtitle, Promotional text, Description, Keywords.
- Category: **Business**. Age rating: complete the questionnaire → **4+**.
- Support URL + Marketing URL (set real URLs).
- **Screenshots**: upload `store/screenshots/01..06` to the **6.7" iPhone**
  slot (1290×2796). Reuse for 6.5" if prompted. Regenerate anytime:
  `node scripts/screenshots.mjs` (with `npm run dev` running).

## 6. App Privacy
Answer per `store/PRIVACY.md` → **Data Not Collected**, no tracking. (If you
ship Live AI pre-enabled, adjust per that file.)

## 7. Review notes
- “The app is fully offline/local. To exercise the flow: add a client → job →
  estimate → convert to contract → sign on screen → add a change order → sign →
  Payments → Proof package.”
- No account required. AI defaults to on-device; no server involved.

## 8. Submit
- Pricing: Free.
- Select the uploaded build, **Submit for Review**.
- Export compliance: already declared exempt (`ITSAppUsesNonExemptEncryption`),
  so no extra prompt.

## Pre-submit checklist
- [ ] Real Support/Marketing URLs set
- [ ] Company name in Settings (drives PDF headers) — note: this is per-user, not
      a store field
- [ ] Screenshots uploaded (6.7")
- [ ] Privacy = Data Not Collected
- [ ] Availability = United States
- [ ] Build archived from `com.walkbid.app`, version 1.0 (1)
