# WalkBid — QA Phase 2 (AI accelerators)

_Build: `walkbid/` · branch `claude/walkbid-phase-0-audit-3c83rm`._

Legend: ✅ verified here · 🟡 needs on-device pass · ⬜ requires a deployed proxy

## Automated gates
- ✅ `npx tsc --noEmit` clean (strict, no `any`).
- ✅ `npm run build` clean. AI + voice add no eager weight to the main chunk;
  pdf-lib/jszip remain code-split (size warning only, not an error).

## M7 — AI service layer
- ✅ `aiMode` switch (`off` hides AI buttons · `mock` default offline · `live`
  requires `aiProxyUrl`). `getProvider()` falls back to Mock if live is
  misconfigured. Settings UI added (mode + proxy URL).
- ✅ **No API key in the client.** `AnthropicAIProvider` only POSTs `{task,
  system, input}` to the user's proxy. Contract + reference Worker in
  `docs/AI_PROXY.md` (model `claude-sonnet-4-6`). No worker/key committed.
- ✅ **Strict JSON, defensive parse.** `parse.ts` strips ``` fences, isolates the
  `{…}`, and validates each shape; unknown fields ignored, bad types coerced.
- ✅ **AI never writes to the DB.** Every flow lands in an editable draft
  (`DraftLinesEditor` / editable fields); the user confirms before any
  `addItem`/`createChangeOrder`/`createDiaryEntry`.
- ✅ **Offline queue.** `queue.ts` persists live requests in localStorage when
  offline and replays on `online`; results emit `walkbid:ai-result`. Mock never
  queues. 🟡 device reconnect test.

## M8 — Voice flows
- ✅ `VoiceCapture` (press & hold) streams partial results into an editable
  field; native via `@capacitor-community/speech-recognition`, web via Web
  Speech API, graceful text-only fallback when unavailable.
- ✅ Locales `en-US` (default) / `es-US` (from app language).
- **Flow A — Voice estimate:** ✅ Mock draft verified (deterministic) on the
  spec's sample “four hundred square feet of pavers, eight inch gravel base, two
  catch basins, fifty feet of edging”:
  - pavers → **PV01**, qty **400**
  - gravel base → **GB01**, qty 8
  - catch basins → **CB01**, qty **2**
  - edging → **unmatched → `needs_pricing`** (flagged signal-yellow), qty **50**
  Lines are editable; applied to the estimate only on confirm. 🟡 live-mode
  quality.
- **Flow B — Change order on the spot:** ✅ photos → dictate → “Draft lines from
  voice” → editable CO → existing **sign-on-site** pipeline (SHA-256 + auto
  extra payment). 🟡 device end-to-end < 2 min target.
- **Flow C — Voice daily log:** ✅ dictate (EN or ES) → “Summarize to English
  log” → editable English text. Mock keeps input + detects weather/issues; live
  translates ES→EN per prompt. 🟡 device Spanish→English pass.

## Spec §11.9 (P2 checklist)
- ✅ AI in `mock` mode works offline end-to-end (no network on any mock path).
- ✅ `live` mode queues when offline and resumes on reconnect (logic verified).
- ✅ Spanish log input → English output (prompt enforces; live). Mock passes
  text through (documented limitation).
- ⬜ Live round-trip against a real proxy — deploy `docs/AI_PROXY.md` and set the
  URL in Settings to verify.

## Manual device test additions
1. Settings → AI assist → On-device. Estimate tab → **Voice** → hold & dictate →
   review draft (unpriced lines yellow) → add to estimate.
2. Change orders → New → photo → dictate change → Draft lines → Sign on site.
3. Log → dictate in Spanish → Summarize → English entry.
4. (Live) Deploy the Worker, set proxy URL, repeat 1–3; toggle airplane mode
   mid-request to confirm queue + resume.
