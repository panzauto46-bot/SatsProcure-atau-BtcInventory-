import { X, Clock, CheckCircle2, XCircle, Copy, FileText, CreditCard } from 'lucide-react';
import type { Invoice } from '@/types';
import { useApp } from '@/context/AppContext';
import { useLanguage } from '@/i18n/LanguageContext';
import { useState } from 'react';

interface Props {
  invoice: Invoice | null;
  isOpen: boolean;
  onClose: () => void;
  onPay: (id: string) => void;
}

export function InvoiceDetailModal({ invoice, isOpen, onClose, onPay }: Props) {
  const { role, isProcessing } = useApp();
  const { t, lang } = useLanguage();
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const locale = lang === 'id' ? 'id-ID' : 'en-US';

  if (!isOpen || !invoice) return null;

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const statusConfig = {
    pending: { icon: Clock, text: t('pendingPayment'), cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    paid: { icon: CheckCircle2, text: t('paidSettled'), cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    cancelled: { icon: XCircle, text: t('cancelled'), cls: 'bg-red-500/10 text-red-400 border-red-500/20' },
  }[invoice.status] || { icon: Clock, text: invoice.status, cls: 'bg-gray-500/10 text-gray-400 border-gray-500/20' };

  const StatusIcon = statusConfig.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-gray-800 bg-gray-950 shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-800 bg-gray-950/95 backdrop-blur px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 ring-1 ring-amber-500/20">
              <FileText className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{invoice.invoiceNumber}</h3>
              <p className="text-xs text-gray-500">{t('invoiceDetail')}</p>
            </div>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-800 text-gray-500 transition-colors hover:bg-gray-800 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Status */}
          <div className="flex justify-center">
            <span className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${statusConfig.cls}`}>
              <StatusIcon className="h-4 w-4" />
              {statusConfig.text}
            </span>
          </div>

          {/* Parties */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-gray-800/50 bg-gray-900/40 p-4">
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-gray-500">{t('supplierCol')}</p>
              <p className="text-sm font-semibold text-white">{invoice.supplier}</p>
              <p className="mt-1 font-mono text-[10px] text-gray-500">{invoice.supplierAddress}</p>
            </div>
            <div className="rounded-xl border border-gray-800/50 bg-gray-900/40 p-4">
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-gray-500">{t('buyerCol')}</p>
              <p className="text-sm font-semibold text-white">{invoice.buyer}</p>
              <p className="mt-1 font-mono text-[10px] text-gray-500">{invoice.buyerAddress}</p>
            </div>
          </div>

          {/* Items */}
          <div className="rounded-xl border border-gray-800/50 bg-gray-900/40 p-4">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-gray-500">{t('items')}</p>
            <div className="space-y-2">
              {invoice.items.map(item => (
                <div key={item.id} className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-white">{item.name}</span>
                    <span className="ml-2 text-xs text-gray-500">× {item.quantity}</span>
                  </div>
                  <span className="font-mono text-sm text-gray-300">{(item.quantity * item.unitPrice).toLocaleString()} sats</span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-gray-800 pt-3">
              <span className="text-sm font-semibold text-gray-400">{t('total')}</span>
              <span className="text-lg font-bold text-amber-400">{invoice.totalAmount.toLocaleString()} sats</span>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">{t('created')}</p>
              <p className="mt-1 text-sm text-gray-300">{new Date(invoice.createdAt).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">{t('dueDate')}</p>
              <p className="mt-1 text-sm text-gray-300">{new Date(invoice.dueDate).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
          </div>

          {/* On-Chain Info */}
          {(invoice.contractAddress || invoice.txHash) && (
            <div className="rounded-xl border border-gray-800/50 bg-gray-900/40 p-4 space-y-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">{t('onChainData')}</p>
              {invoice.contractAddress && (
                <div>
                  <p className="mb-1 text-[10px] text-gray-500">{t('contractAddress')}</p>
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-xs text-gray-400 break-all flex-1">{invoice.contractAddress}</p>
                    <button onClick={() => copyToClipboard(invoice.contractAddress!, 'contract')} className="flex-shrink-0 text-gray-600 hover:text-gray-300">
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  {copiedField === 'contract' && <p className="text-[10px] text-emerald-400 mt-1">{t('copied')}</p>}
                </div>
              )}
              {invoice.txHash && (
                <div>
                  <p className="mb-1 text-[10px] text-gray-500">{t('transactionHash')}</p>
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-xs text-emerald-400 break-all flex-1">{invoice.txHash}</p>
                    <button onClick={() => copyToClipboard(invoice.txHash!, 'tx')} className="flex-shrink-0 text-gray-600 hover:text-gray-300">
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  {copiedField === 'tx' && <p className="text-[10px] text-emerald-400 mt-1">{t('copied')}</p>}
                </div>
              )}
              {invoice.paidAt && (
                <div>
                  <p className="text-[10px] text-gray-500">{t('settlementTime')}</p>
                  <p className="text-xs text-emerald-400">{new Date(invoice.paidAt).toLocaleString(locale)}</p>
                </div>
              )}
            </div>
          )}

          {invoice.notes && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">{t('notes')}</p>
              <p className="mt-1 text-sm text-gray-300">{invoice.notes}</p>
            </div>
          )}

          {/* Pay Button */}
          {invoice.status === 'pending' && role === 'buyer' && (
            <button
              onClick={() => { onPay(invoice.id); onClose(); }}
              disabled={isProcessing}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/25 transition-all hover:shadow-orange-500/40 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
              <CreditCard className="h-4 w-4" />
              {t('payWithBtc')} — {invoice.totalAmount.toLocaleString()} sats
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
