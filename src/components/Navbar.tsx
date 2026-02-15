import { useApp } from '@/context/AppContext';
import { useLanguage } from '@/i18n/LanguageContext';
import { Wallet, LogOut, Bitcoin, ChevronDown, Zap, Languages } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export function Navbar() {
  const { wallet, connectWallet, disconnectWallet, isProcessing } = useApp();
  const { lang, setLang, t } = useLanguage();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setShowLangDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const formatAddress = (addr: string) =>
    addr ? `${addr.slice(0, 8)}...${addr.slice(-6)}` : '';

  const formatSats = (sats: number) => {
    if (sats >= 1_000_000) return `${(sats / 1_000_000).toFixed(2)}M`;
    if (sats >= 1_000) return `${(sats / 1_000).toFixed(1)}K`;
    return sats.toString();
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-800/50 bg-gray-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-orange-500/20">
            <Bitcoin className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-white">
              Sats<span className="text-amber-400">Procure</span>
            </span>
            <span className="hidden sm:block -mt-1 text-[10px] font-medium tracking-widest text-gray-500 uppercase">
              {t('b2bOnBitcoin')}
            </span>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Toggle */}
          <div className="relative" ref={langRef}>
            <button
              onClick={() => setShowLangDropdown(!showLangDropdown)}
              className="flex items-center gap-1.5 rounded-xl border border-gray-700/50 bg-gray-800/60 px-3 py-2 text-xs font-medium text-gray-400 transition-all hover:bg-gray-700/60 hover:text-white hover:border-gray-600"
              title={t('language')}
            >
              <Languages className="h-3.5 w-3.5" />
              <span className="hidden sm:inline uppercase font-semibold">{lang}</span>
              <ChevronDown className={`h-3 w-3 transition-transform ${showLangDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showLangDropdown && (
              <div className="absolute right-0 mt-2 w-40 rounded-xl border border-gray-700/50 bg-gray-900 p-1.5 shadow-2xl shadow-black/50 animate-in fade-in slide-in-from-top-2">
                <button
                  onClick={() => { setLang('en'); setShowLangDropdown(false); }}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    lang === 'en'
                      ? 'bg-amber-500/10 text-amber-400'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <span className="text-base">🇺🇸</span>
                  <span>English</span>
                  {lang === 'en' && <span className="ml-auto text-amber-400 text-xs">✓</span>}
                </button>
                <button
                  onClick={() => { setLang('id'); setShowLangDropdown(false); }}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    lang === 'id'
                      ? 'bg-amber-500/10 text-amber-400'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <span className="text-base">🇮🇩</span>
                  <span>Indonesia</span>
                  {lang === 'id' && <span className="ml-auto text-amber-400 text-xs">✓</span>}
                </button>
              </div>
            )}
          </div>

          {/* Network indicator */}
          <div className="hidden sm:flex items-center gap-2 rounded-full bg-gray-800/60 px-3 py-1.5 text-xs font-medium text-gray-400 border border-gray-700/50">
            <Zap className="h-3 w-3 text-emerald-400" />
            <span className="text-emerald-400">{t('midlTestnet')}</span>
          </div>

          {/* Connect / Wallet Button */}
          {!wallet.connected ? (
            <button
              onClick={connectWallet}
              disabled={isProcessing}
              className="group relative flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/25 transition-all hover:shadow-orange-500/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-wait"
            >
              <Wallet className="h-4 w-4" />
              {isProcessing ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  {t('connecting')}
                </span>
              ) : (
                t('connectXverse')
              )}
            </button>
          ) : (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-3 rounded-xl border border-gray-700/50 bg-gray-800/60 px-4 py-2 text-sm transition-all hover:bg-gray-700/60 hover:border-gray-600"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600">
                  <Wallet className="h-3.5 w-3.5 text-white" />
                </div>
                <div className="hidden sm:flex flex-col items-start">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-white font-mono">
                      {formatAddress(wallet.address)}
                    </span>
                    {wallet.mode === 'demo' && (
                      <span className="rounded bg-amber-500/20 px-1 py-0.5 text-[8px] font-bold uppercase tracking-wider text-amber-500">
                        demo
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-amber-400 font-medium">
                    {formatSats(wallet.balance)} sats
                  </span>
                </div>
                <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl border border-gray-700/50 bg-gray-900 p-2 shadow-2xl shadow-black/50 animate-in fade-in slide-in-from-top-2">
                  <div className="mb-2 rounded-lg bg-gray-800/60 p-3">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-gray-500 mb-1">{t('walletAddress')}</p>
                    <p className="text-xs font-mono text-gray-300 break-all">{wallet.address}</p>
                  </div>
                  <div className="mb-2 rounded-lg bg-gray-800/60 p-3">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-gray-500 mb-1">{t('balance')}</p>
                    <p className="text-lg font-bold text-amber-400">{wallet.balance.toLocaleString()} <span className="text-xs text-gray-500">sats</span></p>
                  </div>
                  <button
                    onClick={() => { disconnectWallet(); setShowDropdown(false); }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10"
                  >
                    <LogOut className="h-4 w-4" />
                    {t('disconnectWallet')}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
