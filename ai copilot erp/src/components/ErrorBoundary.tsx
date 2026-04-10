import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      let errorDetails = null;
      try {
        if (this.state.error?.message) {
          errorDetails = JSON.parse(this.state.error.message);
        }
      } catch (e) {
        // Not a JSON error
      }

      return (
        <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center p-6 font-sans">
          <div className="w-full max-w-2xl bg-white rounded-[40px] p-12 shadow-2xl border border-red-100">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mb-8">
                <AlertTriangle className="w-10 h-10 text-red-600" />
              </div>
              
              <h1 className="text-3xl font-bold text-[#141414] mb-4">Something went wrong</h1>
              <p className="text-[#141414]/60 mb-8 max-w-md">
                We encountered an unexpected error. This might be due to missing permissions or a temporary connection issue.
              </p>

              {errorDetails ? (
                <div className="w-full bg-red-50 rounded-2xl p-6 mb-8 text-left">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-red-600 mb-2">Error Context</p>
                  <div className="space-y-2">
                    <p className="text-sm font-bold text-red-900">Operation: <span className="uppercase">{errorDetails.operationType}</span></p>
                    <p className="text-sm font-bold text-red-900">Path: <span className="font-mono">{errorDetails.path || 'Unknown'}</span></p>
                    <p className="text-xs text-red-800/70 break-all font-medium">{errorDetails.error}</p>
                  </div>
                </div>
              ) : (
                <div className="w-full bg-red-50 rounded-2xl p-6 mb-8 text-left">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-red-600 mb-2">Error Message</p>
                  <p className="text-sm font-medium text-red-900">{this.state.error?.message || 'Unknown error occurred'}</p>
                </div>
              )}

              <div className="flex gap-4 w-full">
                <button 
                  onClick={() => window.location.reload()}
                  className="flex-1 bg-[#141414] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#141414]/90 transition-all"
                >
                  <RefreshCcw className="w-5 h-5" /> Retry
                </button>
                <button 
                  onClick={this.handleReset}
                  className="flex-1 bg-white text-[#141414] py-4 rounded-xl font-bold border border-[#141414]/10 flex items-center justify-center gap-2 hover:bg-[#F5F5F5] transition-all"
                >
                  <Home className="w-5 h-5" /> Go Home
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
