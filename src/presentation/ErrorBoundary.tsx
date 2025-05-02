import React, { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode; // Optional custom fallback UI
}

interface State {
  hasError: boolean;
}

/**
 * ErrorBoundary Component
 *
 * Catches JavaScript errors anywhere in its child component tree,
 * logs those errors, and displays a fallback UI instead of the component tree
 * that crashed.
 */
class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  // Update state so the next render will show the fallback UI.
  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  // Log the error to an error reporting service or console
  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    // TODO: Integrate with an error reporting service like Sentry
    // Example: Sentry.captureException(error, { extra: errorInfo });
  }

  // Render the fallback UI if an error occurred
  public render() {
    if (this.state.hasError) {
      return this.props.fallback ? (
        this.props.fallback
      ) : (
        <div className="flex h-screen w-full flex-col items-center justify-center space-y-4 bg-background p-4 text-center">
          <h1 className="text-2xl font-bold text-destructive">Oops! Something went wrong.</h1>
          <p className="text-muted-foreground">
            An unexpected error occurred. Please try refreshing the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
          >
            Refresh Page
          </button>
          {/* Optional: Add a button to report the error */}
        </div>
      );
    }

    // Normally, just render children
    return this.props.children;
  }
}

export default ErrorBoundary;
