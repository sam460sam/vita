import { Component, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { useT } from '@/i18n';

const RELOAD_GUARD = 'vita.chunkReloaded';

function isChunkError(err: unknown): boolean {
  const msg = (err instanceof Error ? err.message : String(err)) || '';
  return /loading chunk|dynamically imported module|importing a module script failed|failed to fetch dynamically imported|ChunkLoadError/i.test(msg);
}

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

  componentDidCatch(error: unknown) {
    // A stale lazy chunk after a deploy is the common cause of the "black
    // screen". Reload once to fetch the fresh build; guard against loops.
    if (isChunkError(error)) {
      try {
        if (!sessionStorage.getItem(RELOAD_GUARD)) {
          sessionStorage.setItem(RELOAD_GUARD, '1');
          window.location.reload();
        }
      } catch {
        window.location.reload();
      }
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
        <div className="text-5xl mb-4">🌱</div>
        <h1 className="text-xl font-bold text-ink">{title}</h1>
        <p className="text-[15px] text-ink-2 mt-2 max-w-xs leading-relaxed">{desc}</p>
        <button
          onClick={() => {
            try { sessionStorage.removeItem(RELOAD_GUARD); } catch { /* ignore */ }
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
