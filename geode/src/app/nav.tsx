// ============================================================================
// Lightweight navigation context. The app is modal-flow heavy (scan → result →
// paywall), so instead of a URL router we expose imperative open/close actions
// plus the active bottom tab. Keeps deep state in React, survives no reloads
// (native WebView never reloads).
// ============================================================================
import { createContext, useContext } from 'react';

export type Tab = 'home' | 'collection' | 'settings';
export type PaywallSource = 'limit' | 'manual' | 'feature';

export interface Nav {
  tab: Tab;
  setTab: (t: Tab) => void;
  /** Begin the scan flow (handles consent + paywall gating internally). */
  startScan: () => void;
  /** Show the paywall. */
  openPaywall: (source: PaywallSource) => void;
  /** Open a saved stone's detail. */
  openStone: (id: string) => void;
}

export const NavContext = createContext<Nav | null>(null);

export function useNav(): Nav {
  const ctx = useContext(NavContext);
  if (!ctx) throw new Error('useNav must be used within NavContext');
  return ctx;
}
