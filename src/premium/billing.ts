// ============================================================================
// Superwall wrapper. Every call is guarded: on web, or when no API key is set
// (see config.ts), all functions are safe no-ops, so the app keeps building and
// runs exactly as before. Only with a key does this talk to Superwall.
// ============================================================================
import { Capacitor } from '@capacitor/core';
import { Superwall } from '@capawesome/capacitor-superwall';
import { SUPERWALL_API_KEY, PAYWALL_PLACEMENT } from './config';

const platformName = Capacitor.getPlatform();
const apiKey =
  platformName === 'ios' ? SUPERWALL_API_KEY.ios : platformName === 'android' ? SUPERWALL_API_KEY.android : '';

/** True when the paywall is wired (native + an API key is set). */
export function isBillingConfigured(): boolean {
  return Capacitor.isNativePlatform() && apiKey.length > 0;
}

let configured = false;
async function ensureConfigured(): Promise<boolean> {
  if (!isBillingConfigured()) return false;
  if (configured) return true;
  try {
    await Superwall.configure({ apiKey });
    configured = true;
    return true;
  } catch {
    return false;
  }
}

/** Is the subscription currently active? */
export async function getSubscriptionActive(): Promise<boolean> {
  if (!(await ensureConfigured())) return false;
  try {
    const { status } = await Superwall.getSubscriptionStatus();
    return String(status) === 'ACTIVE';
  } catch {
    return false;
  }
}

/**
 * Present the Superwall paywall for a placement (no-op if already subscribed —
 * Superwall decides based on the dashboard campaign).
 */
export async function presentPaywall(placement: string = PAYWALL_PLACEMENT): Promise<void> {
  if (!(await ensureConfigured())) return;
  try {
    await Superwall.register({ placement });
  } catch {
    /* ignore */
  }
}

/** Subscribe to subscription-status changes (purchase, trial end, restore…). */
export async function onStatusChange(cb: (active: boolean) => void): Promise<void> {
  if (!(await ensureConfigured())) return;
  try {
    await Superwall.addListener('subscriptionStatusDidChange', (e) => cb(String(e.status) === 'ACTIVE'));
  } catch {
    /* ignore */
  }
}
