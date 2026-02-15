import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useApp } from '@/context/AppContext';
import { useLanguage } from '@/i18n/LanguageContext';
import { X, Plus, Trash2, FileText, Send } from 'lucide-react';
import type { InvoiceItem } from '@/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateInvoiceModal({ isOpen, onClose }: Props) {
  const { createInvoice } = useApp();
  const { t } = useLanguage();
  const [buyer, setBuyer] = useState('');
  const [buyerAddress, setBuyerAddress] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: uuidv4(), name: '', quantity: 1, unitPrice: 0 },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addItem = () => {
    setItems(prev => [...prev, { id: uuidv4(), name: '', quantity: 1, unitPrice: 0 }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) setItems(prev => prev.filter(i => i.id !== id));
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems(prev =>
      prev.map(item => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyer || !buyerAddress || !dueDate || items.some(i => !i.name || i.unitPrice <= 0)) return;
    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 1500));
    createInvoice({ buyer, buyerAddress, items, dueDate, notes: notes || undefined });
    setIsSubmitting(false);
    setBuyer('');
    setBuyerAddress('');
    setDueDate('');
    setNotes('');
    setItems([{ id: uuidv4(), name: '', quantity: 1, unitPrice: 0 }]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-gray-800 bg-gray-950 shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-800 bg-gray-950/95 backdrop-blur px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 ring-1 ring-amber-500/20">
              <FileText className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{t('createNewInvoice')}</h3>
              <p className="text-xs text-gray-500">{t('deployToSmartContract')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-800 text-gray-500 transition-colors hover:bg-gray-800 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Buyer Info */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-400">
                {t('buyerName')}
              </label>
              <input
                type="text"
                value={buyer}
                onChange={e => setBuyer(e.target.value)}
                placeholder={t('buyerNamePlaceholder')}
                required
                className="w-full rounded-xl border border-gray-800 bg-gray-900/60 px-4 py-3 text-sm text-white placeholder-gray-600 outline-none transition-all focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-400">
                {t('buyerWalletAddress')}
              </label>
              <input
                type="text"
                value={buyerAddress}
                onChange={e => setBuyerAddress(e.target.value)}
                placeholder="bc1q..."
                required
                className="w-full rounded-xl border border-gray-800 bg-gray-900/60 px-4 py-3 text-sm text-white placeholder-gray-600 outline-none font-mono transition-all focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-400">
                {t('dueDateLabel')}
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                required
                className="w-full rounded-xl border border-gray-800 bg-gray-900/60 px-4 py-3 text-sm text-white outline-none transition-all focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 [color-scheme:dark]"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-400">
                {t('notesOptional')}
              </label>
              <input
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder={t('notesPlaceholder')}
                className="w-full rounded-xl border border-gray-800 bg-gray-900/60 px-4 py-3 text-sm text-white placeholder-gray-600 outline-none transition-all focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20"
              />
            </div>
          </div>

          {/* Items */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                {t('itemList')}
              </label>
              <button
                type="button"
                onClick={addItem}
                className="flex items-center gap-1.5 rounded-lg bg-gray-800 px-3 py-1.5 text-xs font-medium text-gray-300 transition-colors hover:bg-gray-700 hover:text-white"
              >
                <Plus className="h-3.5 w-3.5" />
                {t('addItem')}
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, idx) => (
                <div key={item.id} className="flex gap-3 items-start rounded-xl border border-gray-800/50 bg-gray-900/30 p-3">
                  <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-gray-800 text-[10px] font-bold text-gray-500">
                    {idx + 1}
                  </div>
                  <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-3">
                    <input
                      type="text"
                      value={item.name}
                      onChange={e => updateItem(item.id, 'name', e.target.value)}
                      placeholder={t('itemName')}
                      required
                      className="w-full rounded-lg border border-gray-800 bg-gray-900/60 px-3 py-2 text-xs text-white placeholder-gray-600 outline-none focus:border-amber-500/50"
                    />
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={e => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                      placeholder={t('qty')}
                      required
                      className="w-full rounded-lg border border-gray-800 bg-gray-900/60 px-3 py-2 text-xs text-white placeholder-gray-600 outline-none font-mono focus:border-amber-500/50"
                    />
                    <input
                      type="number"
                      min={1}
                      value={item.unitPrice || ''}
                      onChange={e => updateItem(item.id, 'unitPrice', parseInt(e.target.value) || 0)}
                      placeholder={t('priceSats')}
                      required
                      className="w-full rounded-lg border border-gray-800 bg-gray-900/60 px-3 py-2 text-xs text-white placeholder-gray-600 outline-none font-mono focus:border-amber-500/50"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    disabled={items.length <= 1}
                    className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-red-500/10 hover:text-red-400 disabled:opacity-30"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Total + Submit */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-amber-500/20 bg-gradient-to-r from-amber-500/5 to-orange-500/5 p-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">{t('totalInvoice')}</p>
              <p className="text-2xl font-bold text-amber-400">
                {totalAmount.toLocaleString()} <span className="text-sm text-gray-500">sats</span>
              </p>
            </div>
            <button
              type="submit"
              disabled={isSubmitting || !buyer || !buyerAddress || !dueDate || items.some(i => !i.name || i.unitPrice <= 0)}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/25 transition-all hover:shadow-orange-500/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isSubmitting ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  {t('deployingContract')}
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  {t('deployInvoice')}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
