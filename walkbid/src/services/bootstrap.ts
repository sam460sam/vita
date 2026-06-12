// One-time startup: ensure singleton rows exist and seed the price book on
// first run. Idempotent — safe to call on every app open. Also flips overdue
// payments to `late` (computed on open, not a cron — spec §5).
import { db } from '@/data/db';
import { defaultSettings } from '@/data/defaults';
import { seedPriceBook } from '@/data/seed';
import { markOverduePayments } from './payments';

export async function bootstrap(): Promise<void> {
  if (!(await db.settings.get('app'))) {
    await db.settings.put(defaultSettings());
  }
  if ((await db.priceBook.count()) === 0) {
    await db.priceBook.bulkPut(seedPriceBook());
  }
  await markOverduePayments();
}
