import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return this.props.fallback || (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/80 to-slate-900 flex items-center justify-center">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8 shadow-2xl max-w-md mx-4">
            <div className="text-center">
              <div className="text-6xl mb-4 drop-shadow-lg">⚠️</div>
              <h2 className="text-2xl font-bold text-white mb-4 drop-shadow-sm">
                Something went wrong
              </h2>
              <p className="text-purple-200 mb-6">
                An unexpected error occurred. Please try refreshing the page.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}