# WalkBid — marketing site

Static, dependency-free site (matches the app's "Premium Jobsite" brand):

- `index.html` — landing page (hero, screenshots, features, positioning vs Handoff)
- `privacy.html` — privacy policy (the **Support/Privacy URL** for App Store Connect)
- `icon-1024.png`, `screenshots/` — assets (regenerate with the repo scripts)

No build step. Deploy the `site/` folder as-is to any static host.

## Deploy options

**Cloudflare Pages**
1. Push the repo. In Cloudflare → Pages → Create → connect the repo.
2. Build command: _(none)_ · Build output directory: `walkbid/site`.
3. Add your domain `walkbid.app` under Custom domains.

**Netlify**
- Drag-and-drop the `site/` folder at app.netlify.com/drop, or set
  Publish directory = `walkbid/site`, no build command.

**GitHub Pages**
- Copy `site/` to a `docs/` folder (or a `gh-pages` branch) and enable Pages.

**Vercel**
- New Project → set Root Directory to `walkbid/site`, framework “Other”, no build.

## Wire the URLs back to the App Store

Once live, set these in App Store Connect (see `../store/PUBLISH.md`):
- **Marketing URL** → `https://walkbid.app`
- **Support / Privacy Policy URL** → `https://walkbid.app/privacy.html`

Update the `mailto:` (`hello@walkbid.app`) and the “Last updated” date in
`privacy.html` to match your real contact and any policy changes.

## Refresh assets
- Icon: `node ../scripts/make-icon.mjs` then `cp ../public/icon-1024.png .`
- Screenshots: `node ../scripts/screenshots.mjs` (dev server running) then
  `cp ../store/screenshots/*.png screenshots/`
