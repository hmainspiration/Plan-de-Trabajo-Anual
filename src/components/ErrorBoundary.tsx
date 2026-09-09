import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home, Trash2 } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
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
    console.error("Uncaught React Error:", error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleClearAndReset = async () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
        }
      }
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        for (const name of cacheNames) {
          await caches.delete(name);
        }
      }
    } catch (e) {
      console.error(e);
    }
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 text-amber-600 mb-4">
              <AlertCircle size={32} />
            </div>
            
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              Se detectó un problema al cargar la pantalla
            </h2>
            
            <p className="text-sm text-slate-600 mb-6">
              El navegador encontró un error inesperado al intentar mostrar los datos. Puedes recargar la página o restablecer la memoria caché para resolverlo.
            </p>

            {this.state.error && (
              <div className="mb-6 p-3 rounded-xl bg-slate-50 border border-slate-200 text-left">
                <p className="text-[11px] font-mono text-slate-500 break-words line-clamp-3">
                  {this.state.error.message || String(this.state.error)}
                </p>
              </div>
            )}

            <div className="space-y-2.5">
              <button
                onClick={this.handleReload}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition-colors flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20"
              >
                <RefreshCw size={16} /> Recargar Página
              </button>

              <button
                onClick={this.handleGoHome}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm transition-colors flex items-center justify-center gap-2"
              >
                <Home size={16} /> Volver al Inicio
              </button>

              <button
                onClick={this.handleClearAndReset}
                className="w-full py-2 rounded-xl text-xs text-slate-400 hover:text-red-600 transition-colors flex items-center justify-center gap-1.5"
              >
                <Trash2 size={13} /> Limpiar caché y reiniciar
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
