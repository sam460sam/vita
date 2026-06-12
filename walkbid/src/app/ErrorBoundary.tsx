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
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-asphalt px-8 text-center">
          <h1 className="font-display text-xl font-bold text-chalk">Something went wrong</h1>
          <p className="text-sm text-dust">{this.state.error.message}</p>
          <button
            onClick={() => {
              this.setState({ error: null });
              window.location.hash = '#/jobs';
            }}
            className="min-h-touch rounded-btn bg-safety px-5 font-display font-bold text-asphalt"
          >
            Back to Jobs
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
