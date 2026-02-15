import { X, AlertTriangle, Zap, Bitcoin } from 'lucide-react';
import type { Invoice } from '@/types';
import { useApp } from '@/context/AppContext';
import { useLanguage } from '@/i18n/LanguageContext';

interface Props {
  invoice: Invoice | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function PayConfirmModal({ invoice, isOpen, onClose, onConfirm }: Props) {
  const { isProcessing } = useApp();
  const { t } = useLanguage();

  if (!isOpen || !invoice) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl border border-gray-800 bg-gray-950 shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-800 px-6 py-4">
          <h3 className="text-lg font-bold text-white">{t('confirmPayment')}</h3>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-800 text-gray-500 hover:bg-gray-800 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Warning */}
          <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
            <AlertTriangle className="h-5 w-5 flex-shrink-0 text-amber-400 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-400">{t('onChainTransaction')}</p>
              <p className="mt-1 text-xs text-gray-400">
                {t('onChainWarning')} <code className="font-mono text-amber-400">{t('onChainWarningFunc')}</code> {t('onChainWarningSuffix')} <strong className="text-white">{t('irreversible')}</strong>.
              </p>
            </div>
          </div>

          {/* Invoice Summary */}
          <div className="rounded-xl border border-gray-800/50 bg-gray-900/40 p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">{t('invoice')}</span>
              <span className="font-mono font-semibold text-amber-400">{invoice.invoiceNumber}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">{t('supplierCol')}</span>
              <span className="text-white">{invoice.supplier}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">{t('items')}</span>
              <span className="text-gray-300">{invoice.items.length} {t('itemsCount')}</span>
            </div>
            <div className="border-t border-gray-800 pt-3 flex justify-between">
              <span className="text-sm font-semibold text-gray-400">{t('total')}</span>
              <div className="text-right">
                <p className="text-xl font-bold text-amber-400">{invoice.totalAmount.toLocaleString()}</p>
                <p className="text-[10px] text-gray-500">{t('satoshi')}</p>
              </div>
            </div>
          </div>

          {/* Execution details */}
          <div className="rounded-xl border border-gray-800/50 bg-gray-900/40 p-4">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-500">{t('executionPath')}</p>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <Bitcoin className="h-3.5 w-3.5 text-amber-400" />
                <span className="text-gray-400">{t('xverseSign')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-gray-400">{t('midlExecute')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3.5 w-3.5 rounded-full bg-emerald-400 flex items-center justify-center text-[8px] font-bold text-gray-900">✓</div>
                <span className="text-gray-400">{t('onChainConfirm')}</span>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1 rounded-xl border border-gray-800 bg-gray-900 py-3 text-sm font-semibold text-gray-400 transition-all hover:bg-gray-800 hover:text-white disabled:opacity-50"
            >
              {t('cancel')}
            </button>
            <button
              onClick={onConfirm}
              disabled={isProcessing}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/25 transition-all hover:shadow-orange-500/40 disabled:opacity-50 disabled:cursor-wait"
            >
              {isProcessing ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  {t('processing')}
                </>
              ) : (
                t('payNow')
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
