import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { message: string | null };

export class ErrorCatch extends Component<Props, State> {
  state: State = { message: null };

  static getDerivedStateFromError(error: Error): State {
    return { message: error.message || "Something broke" };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(error, info.componentStack);
  }

  render() {
    if (this.state.message) {
      return (
        <main className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-bg px-6 text-center text-fg">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">Field</p>
          <p className="text-lg">Reload and tap Enable sound.</p>
          <button
            type="button"
            className="rounded-full bg-primary px-4 py-2 text-sm text-primary-fg"
            onClick={() => this.setState({ message: null })}
          >
            Try again
          </button>
        </main>
      );
    }
    return this.props.children;
  }
}
