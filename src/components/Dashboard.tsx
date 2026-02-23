import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { useLanguage } from '@/i18n/LanguageContext';
import { StatsCards } from './StatsCards';
import { InvoiceTable } from './InvoiceTable';
import { CreateInvoiceModal } from './CreateInvoiceModal';
import { InvoiceDetailModal } from './InvoiceDetailModal';
import { PayConfirmModal } from './PayConfirmModal';
import { Plus, Filter, ArrowLeft, Package, ShoppingCart, Code2, Bitcoin, ExternalLink, Copy } from 'lucide-react';
import type { Invoice } from '@/types';
import { SATSPROCURE_CONTRACT } from '@/lib/contract';
import { getMidlContractUrl } from '@/lib/midlConfig';

export function Dashboard() {
  const { role, setRole, payInvoice, confirmReceipt, invoices, contractAddress, midlExplorerUrl } = useApp();
  const { t } = useLanguage();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [payingInvoice, setPayingInvoice] = useState<Invoice | null>(null);
  const [showPayConfirm, setShowPayConfirm] = useState(false);
  const [filter, setFilter] = useState('all');
  const [showContractInfo, setShowContractInfo] = useState(false);
  const [copiedContract, setCopiedContract] = useState(false);

  const handlePay = (invoiceId: string) => {
    const inv = invoices.find(i => i.id === invoiceId);
    if (inv) {
      setPayingInvoice(inv);
      setShowPayConfirm(true);
    }
  };

  const confirmPay = async () => {
    if (payingInvoice) {
      await payInvoice(payingInvoice.id);
      setShowPayConfirm(false);
      setPayingInvoice(null);
    }
  };

  const handleView = (inv: Invoice) => {
    setSelectedInvoice(inv);
    setShowDetailModal(true);
  };

  const handleConfirmReceipt = async (invoiceId: string) => {
    await confirmReceipt(invoiceId);
  };

  const copyContractAddr = () => {
    navigator.clipboard.writeText(contractAddress).catch(() => { });
    setCopiedContract(true);
    setTimeout(() => setCopiedContract(false), 2000);
  };

  const RoleIcon = role === 'supplier' ? Package : ShoppingCart;
  const roleLabel = role === 'supplier' ? t('supplier') : t('buyer');
  const roleColor = role === 'supplier' ? 'text-amber-400' : 'text-emerald-400';

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Dashboard Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setRole(null)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-800 text-gray-500 transition-all hover:bg-gray-800 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <RoleIcon className={`h-5 w-5 ${roleColor}`} />
              <h1 className="text-xl font-bold text-white sm:text-2xl">
                {t('dashboard')} <span className={roleColor}>{roleLabel}</span>
              </h1>
            </div>
            <p className="text-sm text-gray-500">{t('manageInvoices')}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Smart Contract Info Toggle */}
          <button
            onClick={() => setShowContractInfo(!showContractInfo)}
            className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-medium transition-all ${showContractInfo
              ? 'border-violet-500/30 bg-violet-500/10 text-violet-400'
              : 'border-gray-800 bg-gray-900/60 text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
          >
            <Code2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t('smartContract')}</span>
          </button>

          {role === 'supplier' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/25 transition-all hover:shadow-orange-500/40 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="h-4 w-4" />
              {t('createInvoice')}
            </button>
          )}
        </div>
      </div>

      {/* Midl Smart Contract Architecture Panel */}
      {showContractInfo && (
        <div className="mb-6 rounded-xl border border-violet-500/20 bg-violet-500/5 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600">
                <Code2 className="h-4 w-4 text-white" />
              </div>
              <h3 className="text-sm font-bold text-violet-400">{t('solidityContract')}</h3>
            </div>
            <a
              href={getMidlContractUrl(contractAddress)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 transition-colors"
            >
              <span>View on Explorer</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          {/* Contract Address */}
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-gray-950/80 px-4 py-3">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Contract:</span>
            <code className="font-mono text-xs text-violet-400 flex-1 break-all">{contractAddress}</code>
            <button onClick={copyContractAddr} className="text-gray-500 hover:text-violet-400 transition-colors">
              <Copy className="h-3.5 w-3.5" />
            </button>
            {copiedContract && <span className="text-[10px] text-emerald-400">Copied!</span>}
          </div>

          {/* Architecture Diagram */}
          <div className="rounded-lg bg-gray-950/80 p-4 font-mono text-xs text-gray-300 overflow-x-auto">
            <pre className="whitespace-pre-wrap leading-relaxed">{`// Midl Smart Contract Architecture (Solidity on Bitcoin)
// ──────────────────────────────────────────────────────

1. Frontend (React + TypeScript)
   ├── User Action (Create Invoice / Pay / Confirm)
   └── Encodes Solidity function call via encodeFunctionData()

2. Midl SDK (@midl/executor)
   ├── addTxIntention() → Queue EVM transaction
   ├── finalizeBTCTransaction() → Calculate BTC costs
   ├── signIntention() → Xverse wallet signs
   └── broadcastTransaction() → Send to Midl network

3. Midl Regtest (Bitcoin EVM Layer)
   ├── Smart Contract: SatsProcure.sol
   │   ├── createInvoice(id, buyer, amount, number)
   │   ├── payInvoice(id, amount) 
   │   ├── confirmReceipt(id)
   │   └── cancelInvoice(id)
   └── Events emitted → Indexed on Blockscout

4. On-Chain Verification
   └── TX Hash → blockscout.regtest.midl.xyz/tx/{hash}

// Network:  Midl Regtest (Bitcoin EVM)
// Wallet:   Xverse (sats-connect + @midl/connectors)
// Contract: SatsProcure.sol (Solidity ^0.8.28)`}</pre>
          </div>
          <div className="mt-3 flex items-center gap-4">
            <p className="flex-1 text-xs text-gray-500">
              {t('contractDesc')} <span className="text-violet-400 font-semibold">{t('contractDescMidlSDK')}</span> {t('contractDescAnd')} <span className="text-violet-400 font-semibold">{t('contractDescMidlRPC')}</span>{t('contractDescSuffix')}
            </p>
            <a
              href={midlExplorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 rounded-lg bg-violet-500/10 border border-violet-500/20 px-3 py-1.5 text-[10px] font-semibold text-violet-400 hover:bg-violet-500/20 transition-colors whitespace-nowrap"
            >
              <Bitcoin className="h-3 w-3" />
              Blockscout Explorer ↗
            </a>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="mb-6">
        <StatsCards />
      </div>

      {/* Filter Bar */}
      <div className="mb-4 flex items-center gap-2">
        <Filter className="h-4 w-4 text-gray-500" />
        {(['all', 'pending', 'partial', 'escrowed', 'paid'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all ${filter === f
              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              : 'text-gray-500 hover:text-gray-300 border border-transparent'
              }`}
          >
            {f === 'all' ? t('filterAll') : f === 'pending' ? t('filterPending') : f === 'partial' ? 'Partial' : f === 'escrowed' ? 'Escrowed' : t('filterPaid')}
          </button>
        ))}
      </div>

      {/* Invoice Table */}
      <InvoiceTable onPay={handlePay} onView={handleView} onConfirmReceipt={handleConfirmReceipt} filter={filter} />

      {/* Modals */}
      <CreateInvoiceModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} />
      <InvoiceDetailModal
        invoice={selectedInvoice}
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        onPay={handlePay}
      />
      <PayConfirmModal
        invoice={payingInvoice}
        isOpen={showPayConfirm}
        onClose={() => { setShowPayConfirm(false); setPayingInvoice(null); }}
        onConfirm={confirmPay}
      />
    </div>
  );
}
