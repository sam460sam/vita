# WalkBid — AI Proxy contract

WalkBid's `live` AI mode never holds an API key in the app. The client posts to
a tiny serverless function **you deploy**; that function adds your Anthropic API
key server-side, calls the Messages API with model **`claude-sonnet-4-6`**, and
returns the model's text. The app parses it defensively (strict JSON).

> Do not commit any API key. This repo contains **no** worker code — only this
> contract and a reference implementation to copy.

## Request (app → proxy)

`POST <aiProxyUrl>` · `Content-Type: application/json`

```json
{
  "task": "draftEstimate | draftChangeOrder | summarizeLog",
  "system": "<system prompt string, already localized by the app>",
  "input": { "transcript": "…", "priceBook": [ … ], "project": { … } }
}
```

The app already builds the `system` prompt (see `src/services/ai/prompts.ts`)
and trims the price book to `{id, code, description, unit, unitPrice}`.

## Response (proxy → app)

```json
{ "text": "<the model's raw reply — must be strict JSON per the system prompt>" }
```

`{ "content": "…" }` is also accepted. The app strips code fences, isolates the
JSON object, and validates the shape, so the model returning ```json fences or
minor noise is tolerated.

## Expected model output shapes

- **draftEstimate** → `{ "items": [{ "description", "qty", "unit", "unitPrice"|null, "priceBookId"|null }], "notes": string|null }`
- **draftChangeOrder** → `{ "title", "description", "items": [ … ], "notes": string|null }`
- **summarizeLog** → `{ "workDone", "crewPresent", "weather", "issues", "text" }`

## Reference implementation (Cloudflare Worker, ~30 lines)

```js
export default {
  async fetch(req, env) {
    if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
    const cors = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
    };
    if (req.method === 'OPTIONS') return new Response(null, { headers: cors });

    const { system, input } = await req.json();
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY, // set as a Worker secret
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        system,
        messages: [{ role: 'user', content: JSON.stringify(input) }],
      }),
    });
    const data = await r.json();
    const text = data?.content?.[0]?.text ?? '';
    return new Response(JSON.stringify({ text }), {
      headers: { 'content-type': 'application/json', ...cors },
    });
  },
};
```

Vercel equivalent: an Edge/Node function doing the same `fetch`, reading
`process.env.ANTHROPIC_API_KEY`, returning `{ text }`.

## Deploy & connect

1. `wrangler secret put ANTHROPIC_API_KEY` (or set it in the Vercel dashboard).
2. Deploy; copy the URL.
3. In WalkBid → Settings → AI assist → **Live** → paste the proxy URL.

## Offline behaviour

If the device is offline in `live` mode, the request is queued
(`src/services/ai/queue.ts`) and replayed on reconnect; results surface via the
`walkbid:ai-result` window event. `mock` mode is fully offline and never queues.

## Privacy

The transcript and price book are sent to your proxy and on to Anthropic **only
in live mode**. Default mode is on-device `mock` (no network). Disclose live-mode
data flow in your App Store privacy answers if you ship it enabled.
