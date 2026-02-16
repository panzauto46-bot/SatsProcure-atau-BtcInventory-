import { useApp } from '@/context/AppContext';
import { useLanguage } from '@/i18n/LanguageContext';
import { Eye, CreditCard, ExternalLink, Clock, CheckCircle2, XCircle, ChevronDown, ChevronUp, ShieldCheck, Layers } from 'lucide-react';
import { useState } from 'react';
import type { Invoice } from '@/types';

function StatusBadge({ status }: { status: string }) {
  const { t } = useLanguage();

  const config = {
    pending: { icon: Clock, text: t('pending'), cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    partial: { icon: Layers, text: 'Partial', cls: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
    escrowed: { icon: ShieldCheck, text: 'In Escrow', cls: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    paid: { icon: CheckCircle2, text: t('paid'), cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    cancelled: { icon: XCircle, text: t('cancelled'), cls: 'bg-red-500/10 text-red-400 border-red-500/20' },
  }[status] || { icon: Clock, text: status, cls: 'bg-gray-500/10 text-gray-400 border-gray-500/20' };

  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider ${config.cls}`}>
      <Icon className="h-3 w-3" />
      {config.text}
    </span>
  );
}

function EscrowProgressBar({ amountPaid, totalAmount }: { amountPaid: number; totalAmount: number }) {
  const pct = totalAmount > 0 ? Math.min((amountPaid / totalAmount) * 100, 100) : 0;
  return (
    <div className="mt-2">
      <div className="flex justify-between text-[10px] text-gray-400 mb-1">
        <span>Paid: {amountPaid.toLocaleString()}</span>
        <span>Total: {totalAmount.toLocaleString()}</span>
      </div>
      <div className="h-1.5 rounded-full bg-gray-800 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${pct >= 100 ? 'bg-gradient-to-r from-blue-400 to-cyan-400' : 'bg-gradient-to-r from-purple-500 to-amber-400'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-[9px] text-gray-500 mt-0.5 text-right">{pct.toFixed(0)}% funded</p>
    </div>
  );
}

function InvoiceRow({ invoice, onPay, onView, onConfirmReceipt }: { invoice: Invoice; onPay: (id: string) => void; onView: (inv: Invoice) => void; onConfirmReceipt: (id: string) => void }) {
  const { role, isProcessing } = useApp();
  const { t, lang } = useLanguage();
  const [expanded, setExpanded] = useState(false);
  const locale = lang === 'id' ? 'id-ID' : 'en-US';

  const showPayButton = (invoice.status === 'pending' || invoice.status === 'partial') && role === 'buyer';
  const showConfirmButton = (invoice.status === 'escrowed' || invoice.status === 'partial') && role === 'buyer';

  return (
    <>
      <tr
        className="group border-b border-gray-800/50 transition-colors hover:bg-gray-800/30 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <td className="px-4 py-4">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-semibold text-amber-400">{invoice.invoiceNumber}</span>
            {expanded ? <ChevronUp className="h-3.5 w-3.5 text-gray-500" /> : <ChevronDown className="h-3.5 w-3.5 text-gray-500" />}
          </div>
        </td>
        <td className="hidden sm:table-cell px-4 py-4 text-sm text-gray-300">{invoice.supplier}</td>
        <td className="hidden md:table-cell px-4 py-4 text-sm text-gray-300">{invoice.buyer}</td>
        <td className="px-4 py-4">
          <span className="font-mono text-sm font-semibold text-white">
            {invoice.totalAmount.toLocaleString()}
          </span>
          <span className="ml-1 text-[10px] text-gray-500">sats</span>
          {/* Show mini progress if partially paid */}
          {(invoice.status === 'partial' || invoice.status === 'escrowed') && (
            <EscrowProgressBar amountPaid={invoice.amountPaid} totalAmount={invoice.totalAmount} />
          )}
        </td>
        <td className="px-4 py-4">
          <StatusBadge status={invoice.status} />
        </td>
        <td className="px-4 py-4">
          <div className="flex items-center gap-2 flex-wrap" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => onView(invoice)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-700/50 bg-gray-800/50 text-gray-400 transition-all hover:border-gray-600 hover:text-white hover:bg-gray-700/50"
              title={t('viewDetails')}
            >
              <Eye className="h-3.5 w-3.5" />
            </button>
            {showPayButton && (
              <button
                onClick={() => onPay(invoice.id)}
                disabled={isProcessing}
                className="flex h-8 items-center gap-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 px-3 text-xs font-semibold text-white shadow-lg shadow-orange-500/20 transition-all hover:shadow-orange-500/30 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-wait"
              >
                <CreditCard className="h-3.5 w-3.5" />
                {invoice.status === 'partial' ? 'Pay More' : t('pay')}
              </button>
            )}
            {showConfirmButton && (
              <button
                onClick={() => onConfirmReceipt(invoice.id)}
                disabled={isProcessing}
                className="flex h-8 items-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 px-3 text-xs font-semibold text-white shadow-lg shadow-blue-500/20 transition-all hover:shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-wait"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                Confirm Receipt
              </button>
            )}
            {invoice.txHash && (
              <a
                href="#"
                onClick={e => e.preventDefault()}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 transition-all hover:bg-emerald-500/20"
                title={`Tx: ${invoice.txHash}`}
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        </td>
      </tr>
      {expanded && (
        <tr className="border-b border-gray-800/50 bg-gray-900/50">
          <td colSpan={6} className="px-4 py-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {/* Items */}
              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-500">{t('items')}</p>
                <div className="space-y-1.5">
                  {invoice.items.map(item => (
                    <div key={item.id} className="flex justify-between text-xs">
                      <span className="text-gray-300">{item.name} × {item.quantity}</span>
                      <span className="font-mono text-gray-400">{(item.quantity * item.unitPrice).toLocaleString()} sats</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Details */}
              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-500">{t('details')}</p>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">{t('created')}</span>
                    <span className="text-gray-300">{new Date(invoice.createdAt).toLocaleDateString(locale)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">{t('dueDate')}</span>
                    <span className="text-gray-300">{new Date(invoice.dueDate).toLocaleDateString(locale)}</span>
                  </div>
                  {invoice.paidAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">{t('paidAt')}</span>
                      <span className="text-emerald-400">{new Date(invoice.paidAt).toLocaleDateString(locale)}</span>
                    </div>
                  )}
                  {invoice.notes && (
                    <div className="mt-2">
                      <span className="text-gray-500">{t('notes')}: </span>
                      <span className="text-gray-300">{invoice.notes}</span>
                    </div>
                  )}
                </div>
              </div>
              {/* Escrow Info */}
              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-500">Escrow & On-Chain</p>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Amount Paid</span>
                    <span className="font-mono text-purple-400">{invoice.amountPaid.toLocaleString()} sats</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Released to Supplier</span>
                    <span className="font-mono text-emerald-400">{invoice.amountReleased.toLocaleString()} sats</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Held in Escrow</span>
                    <span className="font-mono text-blue-400">{(invoice.amountPaid - invoice.amountReleased).toLocaleString()} sats</span>
                  </div>
                  {invoice.contractAddress && (
                    <div className="mt-2">
                      <span className="text-gray-500">{t('contract')}: </span>
                      <span className="font-mono text-gray-400 break-all">{invoice.contractAddress}</span>
                    </div>
                  )}
                  {invoice.txHash && (
                    <div>
                      <span className="text-gray-500">{t('txHash')}: </span>
                      <span className="font-mono text-emerald-400 break-all">{invoice.txHash}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

interface InvoiceTableProps {
  onPay: (id: string) => void;
  onView: (inv: Invoice) => void;
  onConfirmReceipt: (id: string) => void;
  filter: string;
}

export function InvoiceTable({ onPay, onView, onConfirmReceipt, filter }: InvoiceTableProps) {
  const { invoices } = useApp();
  const { t } = useLanguage();

  const filtered = filter === 'all' ? invoices : invoices.filter(i => i.status === filter);

  return (
    <div className="overflow-hidden rounded-xl border border-gray-800/50 bg-gray-900/40 backdrop-blur-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800/50 bg-gray-900/60">
              <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">{t('invoice')}</th>
              <th className="hidden sm:table-cell px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">{t('supplierCol')}</th>
              <th className="hidden md:table-cell px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">{t('buyerCol')}</th>
              <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">{t('amount')}</th>
              <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">{t('status')}</th>
              <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-500">
                  {t('noInvoicesFound')}
                </td>
              </tr>
            ) : (
              filtered.map(invoice => (
                <InvoiceRow key={invoice.id} invoice={invoice} onPay={onPay} onView={onView} onConfirmReceipt={onConfirmReceipt} />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

