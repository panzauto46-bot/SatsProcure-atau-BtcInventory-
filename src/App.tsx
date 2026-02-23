import { LanguageProvider, useLanguage } from '@/i18n/LanguageContext';
import { AppProvider, useApp } from '@/context/AppContext';
import { Navbar } from '@/components/Navbar';
import { RoleSelector } from '@/components/RoleSelector';
import { Dashboard } from '@/components/Dashboard';
import { Notifications } from '@/components/Notifications';
import { TransactionOverlay } from '@/components/TransactionOverlay';

// Midl SDK Providers
import { MidlProvider } from '@midl/react';
import { WagmiMidlProvider } from '@midl/executor-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { midlConfig } from '@/lib/midlConfig';

const queryClient = new QueryClient();


function AppContent() {
  const { role, wallet } = useApp();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans selection:bg-amber-500/30">
      {/* Background Effects */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/10 via-gray-950 to-gray-950" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[600px] w-[800px] rounded-full bg-amber-500/3 blur-3xl opacity-50" />
        <div className="absolute bottom-0 right-0 h-[400px] w-[600px] rounded-full bg-orange-500/3 blur-3xl opacity-30" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:60px_60px] opacity-20" />
      </div>

      <Navbar />

      <main className="relative z-10 flex flex-col flex-grow">
        <div className="mx-auto w-full max-w-7xl px-4 pt-24 pb-12 sm:px-6 lg:px-8 flex-grow">
          {!wallet.connected || !role ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
              <RoleSelector />
            </div>
          ) : (
            <div className="animate-in fade-in zoom-in-95 duration-500 ease-out">
              <Dashboard />
            </div>
          )}
        </div>
      </main>

      <Notifications />
      <TransactionOverlay />

      {/* Footer */}
      <footer className="border-t border-gray-800/30 py-6 mt-auto bg-gray-950/50 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="font-semibold text-gray-400">SatsProcure</span>
              <span>•</span>
              <span>{t('decentralizedB2B')}</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-violet-500/10 border border-violet-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-violet-500 animate-pulse shadow-[0_0_8px_rgba(139,92,246,0.5)]" />
                <span className="font-medium text-violet-400">Midl Regtest</span>
              </div>
              <a
                href="https://blockscout.regtest.midl.xyz"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-violet-400 transition-colors"
              >
                Block Explorer ↗
              </a>
              <span className="text-gray-600">v2.0.0 (Midl VibeHack)</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function AppWithProvider() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export function App() {
  return (
    <MidlProvider config={midlConfig}>
      <QueryClientProvider client={queryClient}>
        <WagmiMidlProvider>
          <LanguageProvider>
            <AppWithProvider />
          </LanguageProvider>
        </WagmiMidlProvider>
      </QueryClientProvider>
    </MidlProvider>
  );
}
