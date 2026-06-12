// `live` provider: calls the user-configured proxy (a tiny serverless function
// they deploy — see docs/AI_PROXY.md). The Anthropic API key lives ONLY on the
// proxy, never in this client. The proxy returns the model's raw text, which we
// parse defensively. Offline live requests are queued for replay.
import type { PriceBookItem } from '@/data/types';
import type { AIProvider, AiTask, ChangeOrderDraft, EstimateDraft, LogDraft, ProjectContext } from './types';
import { draftEstimatePrompt, draftChangeOrderPrompt, summarizeLogPrompt } from './prompts';
import { parseJson, validateChangeOrderDraft, validateEstimateDraft, validateLogDraft } from './parse';
import { enqueue, isOnline } from './queue';

export class OfflineQueuedError extends Error {
  constructor() {
    super('You are offline — the request was queued and will run when back online.');
    this.name = 'OfflineQueuedError';
  }
}

/** Trim the price book to what the model needs (ids, codes, prices, units). */
function slimPriceBook(priceBook: PriceBookItem[]) {
  return priceBook
    .filter((i) => i.active)
    .map((i) => ({ id: i.id, code: i.code, description: i.description.en, unit: i.unit, unitPrice: i.unitPrice }));
}

export class AnthropicAIProvider implements AIProvider {
  constructor(private proxyUrl: string) {}

  private async call(task: AiTask, system: string, input: unknown): Promise<string> {
    if (!isOnline()) {
      enqueue(task, { system, input });
      throw new OfflineQueuedError();
    }
    const res = await fetch(this.proxyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task, system, input }),
    });
    if (!res.ok) throw new Error(`AI proxy error ${res.status}`);
    const data = (await res.json()) as { text?: string; content?: string };
    const text = data.text ?? data.content;
    if (!text) throw new Error('AI proxy returned no content');
    return text;
  }

  async draftEstimate(input: { transcript: string; priceBook: PriceBookItem[]; locale: 'en' | 'es' }): Promise<EstimateDraft> {
    const text = await this.call('draftEstimate', draftEstimatePrompt(input.locale), {
      transcript: input.transcript,
      priceBook: slimPriceBook(input.priceBook),
    });
    return validateEstimateDraft(parseJson(text));
  }

  async draftChangeOrder(input: {
    transcript: string;
    photosContext?: string[];
    priceBook: PriceBookItem[];
    project: ProjectContext;
    locale: 'en' | 'es';
  }): Promise<ChangeOrderDraft> {
    const text = await this.call('draftChangeOrder', draftChangeOrderPrompt(input.locale), {
      transcript: input.transcript,
      photosContext: input.photosContext ?? [],
      project: input.project,
      priceBook: slimPriceBook(input.priceBook),
    });
    return validateChangeOrderDraft(parseJson(text));
  }

  async summarizeLog(input: { transcript: string; date: string; locale: 'en' | 'es' }): Promise<LogDraft> {
    const text = await this.call('summarizeLog', summarizeLogPrompt(input.locale), { transcript: input.transcript, date: input.date });
    return validateLogDraft(parseJson(text));
  }
}
