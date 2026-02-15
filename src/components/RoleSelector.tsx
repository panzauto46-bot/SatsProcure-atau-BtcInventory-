import { useApp } from '@/context/AppContext';
import { useLanguage } from '@/i18n/LanguageContext';
import { Package, ShoppingCart, Bitcoin, ArrowRight, Shield, Zap, Globe } from 'lucide-react';

export function RoleSelector() {
  const { setRole, wallet } = useApp();
  const { t } = useLanguage();

  if (!wallet.connected) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
        <div className="w-full max-w-2xl text-center">
          {/* Hero Section */}
          <div className="mb-12">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-2xl shadow-orange-500/30">
              <Bitcoin className="h-10 w-10 text-white" />
            </div>
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
              {t('heroTitle1')}
              <br />
              <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                {t('heroTitle2')}
              </span>
            </h1>
            <p className="mx-auto max-w-lg text-lg text-gray-400 leading-relaxed">
              {t('heroDesc')}
            </p>
          </div>

          {/* Features */}
          <div className="mb-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              { icon: Shield, title: t('featureSecure'), desc: t('featureSecureDesc') },
              { icon: Zap, title: t('featureInstant'), desc: t('featureInstantDesc') },
              { icon: Globe, title: t('featureTransparent'), desc: t('featureTransparentDesc') },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-xl border border-gray-800 bg-gray-900/50 p-5">
                <Icon className="mx-auto mb-3 h-6 w-6 text-amber-400" />
                <h3 className="mb-1 text-sm font-semibold text-white">{title}</h3>
                <p className="text-xs text-gray-500">{desc}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-orange-500/5 p-8">
            <p className="mb-2 text-sm font-medium text-amber-400">{t('getStarted')}</p>
            <p className="text-gray-400 text-sm">
              {t('getStartedDesc')}{' '}
              <span className="font-semibold text-amber-400">{t('getStartedBtn')}</span>{' '}
              {t('getStartedSuffix')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <div className="w-full max-w-2xl">
        <div className="mb-10 text-center">
          <h2 className="mb-3 text-3xl font-bold text-white">{t('chooseRole')}</h2>
          <p className="text-gray-400">{t('chooseRoleDesc')}</p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Supplier Card */}
          <button
            onClick={() => setRole('supplier')}
            className="group relative overflow-hidden rounded-2xl border border-gray-800 bg-gray-900/80 p-8 text-left transition-all duration-300 hover:border-amber-500/50 hover:bg-gray-900 hover:shadow-2xl hover:shadow-amber-500/10 hover:scale-[1.02] active:scale-[0.98]"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="relative">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 ring-1 ring-amber-500/20">
                <Package className="h-7 w-7 text-amber-400" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-white">{t('supplier')}</h3>
              <p className="mb-6 text-sm leading-relaxed text-gray-400">
                {t('supplierDesc')}
              </p>
              <div className="flex items-center gap-2 text-sm font-semibold text-amber-400">
                {t('enterAsSupplier')}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </button>

          {/* Buyer Card */}
          <button
            onClick={() => setRole('buyer')}
            className="group relative overflow-hidden rounded-2xl border border-gray-800 bg-gray-900/80 p-8 text-left transition-all duration-300 hover:border-emerald-500/50 hover:bg-gray-900 hover:shadow-2xl hover:shadow-emerald-500/10 hover:scale-[1.02] active:scale-[0.98]"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="relative">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 ring-1 ring-emerald-500/20">
                <ShoppingCart className="h-7 w-7 text-emerald-400" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-white">{t('buyer')}</h3>
              <p className="mb-6 text-sm leading-relaxed text-gray-400">
                {t('buyerDesc')}
              </p>
              <div className="flex items-center gap-2 text-sm font-semibold text-emerald-400">
                {t('enterAsBuyer')}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
