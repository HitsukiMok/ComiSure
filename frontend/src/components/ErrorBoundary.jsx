import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ComiSure Error Boundary]', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-canvas flex items-center justify-center px-6">
          <div className="text-center max-w-md">
            <AlertTriangle className="w-12 h-12 text-accent mx-auto mb-4" strokeWidth={1.5} />
            <h1 className="text-heading font-medium text-ink mb-2">Something went wrong</h1>
            <p className="text-graphite mb-6">
              An unexpected error occurred. Please refresh the page or try again later.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 bg-action text-action-text font-medium rounded-btn shadow-button hover:opacity-90 transition-opacity"
            >
              Refresh Page
            </button>
            {this.state.error && (
              <details className="mt-6 text-left">
                <summary className="text-xs text-fog cursor-pointer hover:text-graphite">
                  Technical details
                </summary>
                <pre className="mt-2 p-3 bg-surface border border-border rounded-card-sm text-xs text-fog overflow-auto max-h-32">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
