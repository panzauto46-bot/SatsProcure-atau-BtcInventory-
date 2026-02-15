import { useApp } from '@/context/AppContext';
import { useLanguage } from '@/i18n/LanguageContext';
import { FileText, CheckCircle2, Clock, TrendingUp } from 'lucide-react';

export function StatsCards() {
  const { invoices } = useApp();
  const { t } = useLanguage();

  const totalInvoices = invoices.length;
  const paidCount = invoices.filter(i => i.status === 'paid').length;
  const pendingCount = invoices.filter(i => i.status === 'pending').length;
  const totalVolume = invoices
    .filter(i => i.status === 'paid')
    .reduce((sum, i) => sum + i.totalAmount, 0);

  const stats = [
    {
      label: t('totalInvoices'),
      value: totalInvoices,
      icon: FileText,
      bgColor: 'bg-blue-500/10',
      textColor: 'text-blue-400',
      borderColor: 'border-blue-500/20',
    },
    {
      label: t('paidInvoices'),
      value: paidCount,
      icon: CheckCircle2,
      bgColor: 'bg-emerald-500/10',
      textColor: 'text-emerald-400',
      borderColor: 'border-emerald-500/20',
    },
    {
      label: t('pendingInvoices'),
      value: pendingCount,
      icon: Clock,
      bgColor: 'bg-amber-500/10',
      textColor: 'text-amber-400',
      borderColor: 'border-amber-500/20',
    },
    {
      label: t('volumeSats'),
      value: totalVolume.toLocaleString(),
      icon: TrendingUp,
      bgColor: 'bg-purple-500/10',
      textColor: 'text-purple-400',
      borderColor: 'border-purple-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {stats.map(({ label, value, icon: Icon, bgColor, textColor, borderColor }) => (
        <div
          key={label}
          className={`relative overflow-hidden rounded-xl border ${borderColor} bg-gray-900/60 p-4 sm:p-5 backdrop-blur-sm`}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] sm:text-xs font-medium uppercase tracking-wider text-gray-500">{label}</p>
              <p className="mt-2 text-xl sm:text-2xl font-bold text-white">{value}</p>
            </div>
            <div className={`flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl ${bgColor}`}>
              <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${textColor}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
