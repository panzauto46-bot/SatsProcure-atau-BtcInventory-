import { useApp } from '@/context/AppContext';
import { useLanguage } from '@/i18n/LanguageContext';
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle, Copy } from 'lucide-react';
import { useState } from 'react';

const iconMap = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

const colorMap = {
  success: 'border-emerald-500/30 bg-emerald-500/5',
  error: 'border-red-500/30 bg-red-500/5',
  info: 'border-blue-500/30 bg-blue-500/5',
  warning: 'border-amber-500/30 bg-amber-500/5',
};

const iconColorMap = {
  success: 'text-emerald-400',
  error: 'text-red-400',
  info: 'text-blue-400',
  warning: 'text-amber-400',
};

export function Notifications() {
  const { notifications, dismissNotification } = useApp();
  const { t } = useLanguage();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (notifications.length === 0) return null;

  const copyHash = (hash: string, id: string) => {
    navigator.clipboard.writeText(hash).catch(() => {});
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3 max-w-sm w-full">
      {notifications.slice(0, 5).map(n => {
        const Icon = iconMap[n.type];
        return (
          <div
            key={n.id}
            className={`relative overflow-hidden rounded-xl border ${colorMap[n.type]} p-4 shadow-2xl shadow-black/50 backdrop-blur-xl animate-in slide-in-from-right`}
          >
            <div className="flex items-start gap-3">
              <Icon className={`h-5 w-5 flex-shrink-0 mt-0.5 ${iconColorMap[n.type]}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white">{n.title}</p>
                <p className="mt-0.5 text-xs text-gray-400 leading-relaxed">{n.message}</p>
                {n.txHash && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-[10px] text-gray-500">TX:</span>
                    <span className="font-mono text-[10px] text-emerald-400 truncate flex-1">{n.txHash}</span>
                    <button
                      onClick={() => copyHash(n.txHash!, n.id)}
                      className="flex-shrink-0 text-gray-600 hover:text-gray-300 transition-colors"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                  </div>
                )}
                {copiedId === n.id && (
                  <p className="text-[10px] text-emerald-400 mt-1">{t('txHashCopied')}</p>
                )}
              </div>
              <button
                onClick={() => dismissNotification(n.id)}
                className="flex-shrink-0 text-gray-600 hover:text-gray-300 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {/* Progress bar for auto-dismiss */}
            <div className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-transparent via-white/10 to-transparent w-full">
              <div className={`h-full ${n.type === 'success' ? 'bg-emerald-500' : n.type === 'error' ? 'bg-red-500' : n.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'} animate-shrink`} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
