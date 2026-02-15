import { useApp } from '@/context/AppContext';
import { useLanguage } from '@/i18n/LanguageContext';
import { Package, ShoppingCart, Bitcoin, ArrowRight, Shield, Zap, Globe } from 'lucide-react';

export function RoleSelector() {
  const { setRole, wallet } = useApp();
  const { t } = useLanguage();

  if (!wallet.connected) {
    return (
      <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center p-4">
        <div className="w-full max-w-4xl text-center space-y-16">
          {/* Hero Section */}
          <div className="space-y-6">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-xl shadow-orange-500/20 ring-1 ring-white/10">
              <Bitcoin className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl md:text-7xl">
              {t('heroTitle1')}
              <span className="block mt-1 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                {t('heroTitle2')}
              </span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-gray-400 leading-relaxed md:text-xl">
              {t('heroDesc')}
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {[
              { icon: Shield, title: t('featureSecure'), desc: t('featureSecureDesc'), color: 'text-emerald-400' },
              { icon: Zap, title: t('featureInstant'), desc: t('featureInstantDesc'), color: 'text-amber-400' },
              { icon: Globe, title: t('featureTransparent'), desc: t('featureTransparentDesc'), color: 'text-blue-400' },
            ].map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="group relative rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur-sm transition-all hover:bg-white/10 hover:-translate-y-1">
                <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 ${color} ring-1 ring-white/10 transition-transform group-hover:scale-110`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-white">{title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center px-4">
      <div className="w-full max-w-4xl">
        <div className="mb-12 text-center space-y-4">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">{t('chooseRole')}</h2>
          <p className="text-gray-400 text-lg">{t('chooseRoleDesc')}</p>
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
