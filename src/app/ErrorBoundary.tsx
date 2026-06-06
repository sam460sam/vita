import { Component, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { useT } from '@/i18n';

// Stored in localStorage as a timestamp; reload is allowed if the last attempt
// was more than 30 s ago, preventing rapid infinite loops while still allowing
// recovery from real crashes after the first stale-cache reload.
const RELOAD_GUARD = 'vita.lastCrashReload';
const RELOAD_COOLDOWN_MS = 30_000;

interface Labels {
  title: string;
  desc: string;
  reload: string;
}

interface Props {
  resetKey: string;
  labels: Labels;
  children: ReactNode;
}
interface State {
  hasError: boolean;
}

class Inner extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(_error: unknown) {
    // A stale service-worker cache after a deploy is a common crash cause.
    // Reload once to pick up fresh assets; guard against infinite loops.
    try {
      const lastReload = localStorage.getItem(RELOAD_GUARD);
      const recentlyReloaded = lastReload && Date.now() - Number(lastReload) < RELOAD_COOLDOWN_MS;
      if (!recentlyReloaded) {
        localStorage.setItem(RELOAD_GUARD, String(Date.now()));
        // Clear all service-worker caches so the next load gets fresh JS.
        if ('caches' in window) {
          caches.keys().then((names) => names.forEach((n) => caches.delete(n)));
        }
        window.location.reload();
      }
    } catch {
      window.location.reload();
    }
  }

  componentDidUpdate(prev: Props) {
    // Navigating away from the broken screen clears the error.
    if (this.state.hasError && prev.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    const { title, desc, reload } = this.props.labels;
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-8 bg-app">
        <img src="./betoniera.png" alt="" className="w-24 h-24 rounded-2xl mb-4 shadow-md object-cover" />
        <h1 className="text-xl font-bold text-ink">{title}</h1>
        <p className="text-[15px] text-ink-2 mt-2 max-w-xs leading-relaxed">{desc}</p>
        <button
          onClick={() => {
            try { localStorage.removeItem(RELOAD_GUARD); } catch { /* ignore */ }
            window.location.reload();
          }}
          className="mt-6 h-12 px-6 rounded-btn bg-primary text-on-primary border border-primary-border font-semibold active:opacity-80"
        >
          {reload}
        </button>
      </div>
    );
  }
}

/** Catches render/chunk errors so a failure shows a recovery screen instead of
 *  a blank black page. Resets automatically when the route changes. */
export function RouteErrorBoundary({ children }: { children: ReactNode }) {
  const location = useLocation();
  const t = useT();
  return (
    <Inner
      resetKey={location.pathname}
      labels={{ title: t('error.title'), desc: t('error.desc'), reload: t('error.reload') }}
    >
      {children}
    </Inner>
  );
}
