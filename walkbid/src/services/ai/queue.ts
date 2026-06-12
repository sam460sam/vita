// Offline queue for `live` AI requests (build spec §6 M7). Mock mode works
// offline and never queues. When live mode is offline, the request is stored
// and replayed on reconnect; results are emitted as a window event that an
// open draft screen can pick up.
import type { AiTask } from './types';

export interface QueuedRequest {
  id: string;
  task: AiTask;
  payload: unknown;
  createdAt: number;
}

const KEY = 'walkbid.ai.queue';

export const isOnline = (): boolean => (typeof navigator === 'undefined' ? true : navigator.onLine);

function read(): QueuedRequest[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}
function write(items: QueuedRequest[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    /* ignore */
  }
}

export function enqueue(task: AiTask, payload: unknown): QueuedRequest {
  const req: QueuedRequest = { id: `q_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, task, payload, createdAt: Date.now() };
  write([...read(), req]);
  return req;
}

export function pending(): QueuedRequest[] {
  return read();
}

export function remove(id: string) {
  write(read().filter((r) => r.id !== id));
}

export function clear() {
  write([]);
}

/**
 * Drain the queue by replaying each request through `runner`. Successful
 * results dispatch `walkbid:ai-result` so a mounted draft screen can consume
 * them. Call on app start and on the browser `online` event.
 */
export async function flush(runner: (req: QueuedRequest) => Promise<unknown>): Promise<void> {
  if (!isOnline()) return;
  for (const req of read()) {
    try {
      const result = await runner(req);
      remove(req.id);
      window.dispatchEvent(new CustomEvent('walkbid:ai-result', { detail: { id: req.id, task: req.task, result } }));
    } catch {
      // Leave in queue; will retry on the next flush.
      break;
    }
  }
}
