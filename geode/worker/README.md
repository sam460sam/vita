# Geode Proxy (Cloudflare Worker)

This Worker is the **only** backend. It keeps the Google Gemini API key
server-side and returns clean JSON to the app. The key is **never** shipped in
the iOS app.

## 1. Prerequisites

- A Cloudflare account (free tier is fine)
- [`wrangler`](https://developers.cloudflare.com/workers/wrangler/) installed:
  `npm i -g wrangler` then `wrangler login`
- A **Google Gemini API key** from <https://aistudio.google.com/apikey>

## 2. Configure

```bash
cd worker

# Set the AI key as a SECRET (it is NOT stored in wrangler.toml):
wrangler secret put AI_API_KEY
# paste your Gemini key when prompted

# (Recommended) create a KV namespace for per-IP rate limiting:
wrangler kv namespace create RATE_LIMIT
# copy the printed id into wrangler.toml under [[kv_namespaces]] and uncomment it
```

## 3. Deploy

```bash
wrangler deploy
```

Wrangler prints your Worker URL, e.g.
`https://geode-proxy.YOUR_SUBDOMAIN.workers.dev`.

Paste that URL into the app:
- `geode/src/lib/config.ts` → `proxyUrl`, **or**
- set `VITE_PROXY_URL` at build time.

## 4. Test

```bash
curl -X POST https://geode-proxy.YOUR_SUBDOMAIN.workers.dev \
  -H "Content-Type: application/json" \
  -d '{"imageBase64":"<base64-jpeg>","mode":"identify"}'
```

You should get back JSON with a `candidates` array.

## Request contract

```jsonc
// POST body
{ "imageBase64": "<base64 JPEG, no data: prefix>",
  "mode": "identify" | "refine",
  "answers": [ { "question": "Is it magnetic?", "answer": "No" } ] }
```

## Notes

- **Model:** defaults to `gemini-2.5-flash` (cheap, fast vision). Override with
  the `GEMINI_MODEL` var in `wrangler.toml`.
- **API key format:** both the new-style keys (prefix `AQ.`) and classic `AIza`
  keys work — the Worker authenticates via the `x-goog-api-key` header.
- **Cost:** the app sends a ≤768px JPEG (q0.7), so each scan is a tiny number of
  tokens — well under \$0.001/scan.
- **Rate limiting:** 30 requests / IP / hour by default (tune `RATE_LIMIT` and
  `RATE_WINDOW` in `geode-proxy.js`).
- **CORS:** open (`*`) so the Capacitor WebView (origin `capacitor://` /
  `ionic://` / `http://localhost`) can call it. Lock this down to your app
  origins in production if you prefer.
