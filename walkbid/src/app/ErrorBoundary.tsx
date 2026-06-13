import { Component, type ReactNode } from 'react';

interface State {
  error: Error | null;
}

// Catches render crashes (e.g. a stale lazy chunk) so the app never black-screens.
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg px-8 text-center">
          <h1 className="font-display text-xl font-bold text-ink">Something went wrong</h1>
          <p className="text-sm text-muted">{this.state.error.message}</p>
          <button
            onClick={() => {
              this.setState({ error: null });
              window.location.hash = '#/jobs';
            }}
            className="min-h-touch rounded-btn bg-accent px-5 font-display font-bold text-on-accent"
          >
            Back to Jobs
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
