/**
 * ErrorBoundary component
 *
 * React error boundary that catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of the component tree that crashed.
 *
 * This prevents the dreaded "blank white screen" when React components throw errors.
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details for debugging
    console.error('[ErrorBoundary] Caught error:', error);
    console.error('[ErrorBoundary] Component stack:', errorInfo.componentStack);

    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
          <div className="max-w-2xl w-full bg-white rounded-lg shadow-xl p-8">
            {/* Error Icon */}
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 bg-red-100 rounded-full">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            {/* Error Title */}
            <h1 className="text-3xl font-bold text-gray-900 text-center mb-4">
              Something Went Wrong
            </h1>

            {/* Error Description */}
            <p className="text-gray-600 text-center mb-6">
              The application encountered an unexpected error. This has been logged for debugging.
              You can try reloading the page or resetting the error state.
            </p>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-center mb-6">
              <button
                onClick={this.handleReload}
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Reload Application
              </button>
              <button
                onClick={this.handleReset}
                className="px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
              >
                Try Again
              </button>
            </div>

            {/* Error Details (Expandable) */}
            <details className="mt-6">
              <summary className="cursor-pointer text-sm font-semibold text-gray-700 hover:text-gray-900 mb-3">
                Technical Details (for debugging)
              </summary>

              <div className="space-y-4">
                {/* Error Message */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Error Message:</h3>
                  <pre className="bg-red-50 border border-red-200 rounded p-3 text-xs text-red-900 overflow-auto">
                    {this.state.error?.toString()}
                  </pre>
                </div>

                {/* Error Stack */}
                {this.state.error?.stack && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Stack Trace:</h3>
                    <pre className="bg-gray-50 border border-gray-200 rounded p-3 text-xs text-gray-700 overflow-auto max-h-64">
                      {this.state.error.stack}
                    </pre>
                  </div>
                )}

                {/* Component Stack */}
                {this.state.errorInfo?.componentStack && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Component Stack:</h3>
                    <pre className="bg-gray-50 border border-gray-200 rounded p-3 text-xs text-gray-700 overflow-auto max-h-64">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </div>
                )}
              </div>
            </details>

            {/* Help Text */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>For developers:</strong> Check the browser console for more detailed error
                information. If this error persists, please report it with the technical details
                above.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
