// api/assistant.ts
// Vercel Serverless Function (Node runtime).
// Proxy verso l'API di Anthropic: la chiave resta SOLO sul server, mai nell'app.
//
// Posizione nel progetto: /api/assistant.ts  (cartella "api" alla radice del repo)
// Dipendenza: npm i -D @vercel/node
//
// Variabile d'ambiente da impostare su Vercel (Project > Settings > Environment Variables):
//   ANTHROPIC_API_KEY = sk-ant-...   (la TUA chiave, NON nel codice)

import type { VercelRequest, VercelResponse } from '@vercel/node';

// Domini autorizzati a chiamare il proxy (riduce gli abusi).
const ALLOWED_ORIGINS = [
  'https://vita-app-nine.vercel.app',
  'http://localhost:5173', // dev locale (Vite)
  'capacitor://localhost', // app iOS (Capacitor)
  'https://localhost',     // app Android (Capacitor)
];

// Modello deciso lato server (così il client non può chiederne uno costoso).
const MODEL = 'claude-haiku-4-5-20251001'; // economico, ottimo per consigli brevi
const MAX_TOKENS = 512;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const origin = req.headers.origin as string | undefined;

  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (origin && !ALLOWED_ORIGINS.includes(origin)) {
    return res.status(403).json({ error: 'Origin not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server misconfigured: missing API key' });
  }

  try {
    const { system, messages } = req.body ?? {};
    if (!Array.isArray(messages)) {
      return res.status(400).json({ error: 'Body must include a "messages" array' });
    }

    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system,
        messages,
      }),
    });

    const data = await anthropicRes.json();
    return res.status(anthropicRes.status).json(data);
  } catch (err) {
    console.error('Proxy error:', err);
    return res.status(500).json({ error: 'Upstream request failed' });
  }
}
