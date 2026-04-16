import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends Component<any, any> {
  constructor(props: any) {
    super(props);
    (this as any).state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if ((this as any).state.hasError) {
      return (
        <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6 transition-colors duration-300">
          <div className="bg-white w-full max-w-md p-8 rounded-[32px] shadow-2xl border border-zinc-100 text-center">
            <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <AlertCircle size={32} />
            </div>
            <h2 className="text-2xl font-black text-zinc-900 mb-2 tracking-tight">Something went wrong</h2>
            <p className="text-zinc-500 mb-8 leading-relaxed">
              We encountered an unexpected error. Don't worry, your data is safe in local storage.
            </p>
            
            {(this as any).state.error && (
              <div className="mb-8 p-4 bg-zinc-50 rounded-xl border border-zinc-100 text-left overflow-auto max-h-32">
                <code className="text-xs text-rose-600 font-mono">
                  {(this as any).state.error.toString()}
                </code>
              </div>
            )}

            <button
              onClick={() => window.location.reload()}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-zinc-900 text-white rounded-2xl font-bold hover:bg-zinc-800 transition-all active:scale-[0.98] shadow-lg shadow-zinc-200"
            >
              <RefreshCw size={20} />
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}
