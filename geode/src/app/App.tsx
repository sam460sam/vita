// ============================================================================
// App shell — splash/loading gate, onboarding gate, then the tabbed main app
// with the scan flow, paywall and stone-detail overlays wired through nav.
// ============================================================================
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AppStateProvider, useAppState } from '@/state/AppState';
import { ToastProvider } from '@/ui';
import { NavContext, type PaywallSource, type Tab } from './nav';
import { TabBar } from './TabBar';
import { Onboarding } from '@/features/onboarding/Onboarding';
import { HomeScreen } from '@/features/home/HomeScreen';
import { CollectionScreen } from '@/features/collection/CollectionScreen';
import { SettingsScreen } from '@/features/settings/SettingsScreen';
import { ScanFlow } from '@/features/scan/ScanFlow';
import { Paywall } from '@/features/paywall/Paywall';
import { StoneDetail } from '@/features/collection/StoneDetail';
import { SplashGate } from './SplashGate';

export function App() {
  return (
    <AppStateProvider>
      <ToastProvider>
        <Root />
      </ToastProvider>
    </AppStateProvider>
  );
}

function Root() {
  const { ready, onboarded, completeOnboarding } = useAppState();

  if (!ready) return <SplashGate />;
  if (!onboarded) return <Onboarding onDone={() => void completeOnboarding()} />;
  return <MainApp />;
}

function MainApp() {
  const { canScan } = useAppState();
  const [tab, setTab] = useState<Tab>('home');
  const [scanOpen, setScanOpen] = useState(false);
  const [paywall, setPaywall] = useState<PaywallSource | null>(null);
  const [stoneId, setStoneId] = useState<string | null>(null);

  const startScan = useCallback(() => {
    if (!canScan) {
      setPaywall('limit');
      return;
    }
    setScanOpen(true);
  }, [canScan]);

  const openPaywall = useCallback((source: PaywallSource) => setPaywall(source), []);
  const openStone = useCallback((id: string) => setStoneId(id), []);

  // Deep link from the iOS Widget / App Intent ("Identify with Geode").
  useEffect(() => {
    const onLink = (e: Event) => {
      if ((e as CustomEvent).detail === 'scan') startScan();
    };
    window.addEventListener('geode:deeplink', onLink);
    return () => window.removeEventListener('geode:deeplink', onLink);
  }, [startScan]);

  const nav = useMemo(
    () => ({ tab, setTab, startScan, openPaywall, openStone }),
    [tab, startScan, openPaywall, openStone],
  );

  return (
    <NavContext.Provider value={nav}>
      <main className="flex-1">
        {tab === 'home' && <HomeScreen />}
        {tab === 'collection' && <CollectionScreen />}
        {tab === 'settings' && <SettingsScreen />}
      </main>

      <TabBar tab={tab} onTab={setTab} onScan={startScan} />

      {scanOpen && (
        <ScanFlow
          onClose={() => setScanOpen(false)}
          onUnlock={() => setPaywall('feature')}
        />
      )}

      {paywall && (
        <Paywall
          onClose={() => setPaywall(null)}
          onPurchased={() => setPaywall(null)}
        />
      )}

      {stoneId && <StoneDetail id={stoneId} onClose={() => setStoneId(null)} />}
    </NavContext.Provider>
  );
}
