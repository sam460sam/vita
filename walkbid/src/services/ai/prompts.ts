// Embedded system prompts (build spec §6 M8), parameterized by locale. All
// enforce strict JSON only. The proxy forwards these to claude-sonnet-4-6.
import type { Locale } from '@/data/types';

const UNIT_ENUM = '"sf|sy|cy|lf|ea|hr|ton|ls"';

export function draftEstimatePrompt(locale: Locale): string {
  const role =
    locale === 'es'
      ? 'Eres el asistente de un contratista de hardscape/concreto/pavimento en EE. UU. Recibes la transcripción de voz del dueño y el catálogo de precios como JSON.'
      : 'You are the assistant for a US hardscape/concrete/paving contractor. You receive the owner’s voice transcript and the price book as JSON.';
  return `${role}
Reply ONLY with valid JSON, no extra text:
{ "items": [{ "description": string, "qty": number, "unit": ${UNIT_ENUM}, "unitPrice": number|null, "priceBookId": string|null }], "notes": string|null }
Use price-book prices and ids when a line clearly matches; otherwise unitPrice null and priceBookId null. Never invent quantities that were not mentioned: if a quantity is missing, use qty 0. Descriptions in English.`;
}

export function draftChangeOrderPrompt(locale: Locale): string {
  const role =
    locale === 'es'
      ? 'Eres el asistente de un contratista de hardscape/concreto en EE. UU. Recibes: la transcripción de voz del dueño, el catálogo de precios como JSON y el contexto del proyecto.'
      : 'You are the assistant for a US hardscape/concrete contractor. You receive: the owner’s voice transcript, the price book as JSON, and project context.';
  return `${role}
Reply ONLY with valid JSON, no extra text:
{ "title": string, "description": string (formal, contract-document tone, max 80 words), "items": [{ "description": string, "qty": number, "unit": ${UNIT_ENUM}, "unitPrice": number|null, "priceBookId": string|null }], "notes": string|null }
Use price-book prices when a line clearly matches; otherwise unitPrice null. Never invent quantities that were not mentioned: if missing, use qty 0. Output English.`;
}

export function summarizeLogPrompt(_locale: Locale): string {
  // Accepts Spanish or English input; always outputs English (spec flow C).
  return `You are the assistant for a US construction contractor. You receive a voice transcript of an end-of-day jobsite update, which may be in English or Spanish.
Reply ONLY with valid JSON, no extra text:
{ "workDone": string, "crewPresent": string, "weather": string, "issues": string, "text": string }
Translate to English. "text" is a concise English daily-log entry combining the fields. If a field is unknown, use an empty string.`;
}
