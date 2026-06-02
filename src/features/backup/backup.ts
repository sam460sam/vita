// ============================================================================
// Backup & restore — Vita stays 100% local (no account, no server). Data
// already survives app updates (IndexedDB persists); this module protects
// against the cases that DO wipe local data: uninstall / new device / browser
// eviction. Strategy:
//   1. Request persistent storage so the browser won't evict IndexedDB.
//   2. One-tap export to a file the user keeps in iCloud/Drive/Files.
//   3. One-tap restore from that file.
//   4. A gentle reminder when a backup is overdue.
// ============================================================================
import { format } from 'date-fns';
import { exportBackup, importBackup } from '@/data/repo';
import { platform } from '@/platform/platform';
import type { VitaBackup } from '@/data/types';

const LAST_KEY = 'vita.backup.lastAt';
const REMIND_DAYS = 7;

export function lastBackupAt(): number | null {
  try {
    const v = localStorage.getItem(LAST_KEY);
    return v ? Number(v) : null;
  } catch {
    return null;
  }
}

function setLastBackupAt(t: number) {
  try {
    localStorage.setItem(LAST_KEY, String(t));
  } catch {
    /* ignore */
  }
}

export function daysSinceBackup(): number | null {
  const last = lastBackupAt();
  if (!last) return null;
  return Math.floor((Date.now() - last) / 86_400_000);
}

/** True when there's meaningful data and no recent backup. */
export function needsBackupNudge(hasData: boolean): boolean {
  if (!hasData) return false;
  const since = daysSinceBackup();
  return since === null || since >= REMIND_DAYS;
}

/** Export the full state to a file (download on web, share sheet on native). */
export async function backupToFile(): Promise<void> {
  const backup = await exportBackup();
  const json = JSON.stringify(backup);
  await platform.saveTextFile(`vita-backup-${format(new Date(), 'yyyy-MM-dd')}.vita.json`, json);
  setLastBackupAt(Date.now());
}

export type RestoreResult = 'ok' | 'cancel' | 'invalid';

/** Restore from a user-picked backup file (replaces current data). */
export async function restoreFromFile(): Promise<RestoreResult> {
  const text = await platform.pickTextFile('application/json,.json');
  if (!text) return 'cancel';
  try {
    const data = JSON.parse(text) as VitaBackup;
    if (data?.schema !== 'vita') return 'invalid';
    await importBackup(data, 'replace');
    return 'ok';
  } catch {
    return 'invalid';
  }
}
