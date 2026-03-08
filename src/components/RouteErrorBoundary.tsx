import { Component, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";

interface Props {
  children: ReactNode;
  fallbackRoute?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class RouteErrorBoundaryInner extends Component<Props & { onNavigate: (path: string) => void }, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("Route error:", error, info.componentStack);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    this.props.onNavigate(this.props.fallbackRoute ?? "/");
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[60vh] items-center justify-center p-6">
          <div className="max-w-md text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-foreground">This page encountered an error</h2>
            <p className="text-sm text-muted-foreground">
              {this.state.error?.message || "Something unexpected happened. You can retry or go back to safety."}
            </p>
            <div className="flex gap-3 justify-center pt-2">
              <button
                onClick={this.handleRetry}
                className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
              >
                Retry
              </button>
              <button
                onClick={this.handleGoHome}
                className="inline-flex items-center justify-center rounded-md border border-input bg-background px-5 py-2 text-sm font-medium text-foreground shadow-sm hover:bg-accent transition-colors"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/** Wraps a route's lazy component so crashes are isolated to that page only. */
const RouteErrorBoundary = ({ children, fallbackRoute }: Props) => {
  const navigate = useNavigate();
  return (
    <RouteErrorBoundaryInner onNavigate={(p) => navigate(p)} fallbackRoute={fallbackRoute}>
      {children}
    </RouteErrorBoundaryInner>
  );
};

export default RouteErrorBoundary;
