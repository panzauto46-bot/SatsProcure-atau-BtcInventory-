import { Loader2, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export function TransactionOverlay() {
    const { isProcessing } = useApp();

    if (!isProcessing) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="relative flex flex-col items-center justify-center p-8 rounded-2xl bg-gray-900 border border-gray-800 shadow-2xl max-w-sm w-full mx-4">
                {/* Animated Background Glow */}
                <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 via-transparent to-emerald-500/10 rounded-2xl animate-pulse" />

                {/* Icon Animation */}
                <div className="relative mb-6">
                    <div className="absolute inset-0 bg-amber-500/20 blur-xl rounded-full animate-ping" />
                    <div className="relative bg-gray-950 p-4 rounded-full border border-gray-800">
                        <Loader2 className="h-10 w-10 text-amber-500 animate-spin" />
                    </div>
                </div>

                {/* Text Content */}
                <h3 className="text-xl font-bold text-white mb-2 text-center">Processing Transaction</h3>

                <div className="space-y-3 w-full">
                    <div className="flex items-center gap-3 text-sm text-gray-400 bg-gray-950/50 p-3 rounded-lg border border-gray-800/50">
                        <ShieldCheck className="h-4 w-4 text-emerald-500" />
                        <span>Verifying visuals...</span>
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 ml-auto animate-in zoom-in duration-300 delay-700" />
                    </div>

                    <div className="flex items-center gap-3 text-sm text-gray-400 bg-gray-950/50 p-3 rounded-lg border border-gray-800/50">
                        <Loader2 className="h-4 w-4 text-amber-500 animate-spin" />
                        <span>Confirming on Blockchain...</span>
                    </div>
                </div>

                <p className="mt-6 text-xs text-gray-500 text-center animate-pulse">
                    Please confirm the transaction in your wallet...
                </p>
            </div>
        </div>
    );
}
