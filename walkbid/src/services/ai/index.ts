// Provider selection by `aiMode` (build spec §6 M7):
//   off  → AI buttons hidden (UI checks `aiEnabled`)
//   mock → deterministic offline provider (default)
//   live → proxy-backed provider (requires aiProxyUrl)
import { readSettings } from '@/services/settings';
import { MockAIProvider } from './MockAIProvider';
import { AnthropicAIProvider } from './AnthropicAIProvider';
import { flush } from './queue';
import type { AIProvider } from './types';
import type { AiMode } from '@/data/types';

export type { AIProvider } from './types';
export type { EstimateDraft, ChangeOrderDraft, LogDraft, DraftLine } from './types';
export { OfflineQueuedError } from './AnthropicAIProvider';

const mock = new MockAIProvider();

export async function getProvider(): Promise<AIProvider> {
  const s = await readSettings();
  if (s.aiMode === 'live' && s.aiProxyUrl) return new AnthropicAIProvider(s.aiProxyUrl);
  return mock; // 'mock' and a misconfigured 'live' both fall back to offline mock
}

export async function aiMode(): Promise<AiMode> {
  return (await readSettings()).aiMode;
}

/** Whether AI surfaces (voice buttons) should be shown at all. */
export async function aiEnabled(): Promise<boolean> {
  return (await readSettings()).aiMode !== 'off';
}

/**
 * Replay any queued live requests when back online (build spec §6 M7). Results
 * are dispatched as `walkbid:ai-result`. Safe to call on app start; also binds
 * the browser `online` event.
 */
export function startAiQueueFlush(): void {
  const run = async () => {
    const s = await readSettings();
    if (s.aiMode !== 'live' || !s.aiProxyUrl) return;
    const proxyUrl = s.aiProxyUrl;
    await flush(async (req) => {
      const { system, input } = req.payload as { system: string; input: unknown };
      const res = await fetch(proxyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task: req.task, system, input }),
      });
      if (!res.ok) throw new Error('proxy error');
      const data = (await res.json()) as { text?: string; content?: string };
      return data.text ?? data.content ?? '';
    });
  };
  void run();
  window.addEventListener('online', () => void run());
}
