import { StockInfo } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { SignalBadge } from './SignalBadge';
import { ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

export function StockCard({ stock }: { stock: StockInfo }) {
  const isPositive = stock.priceChange >= 0;

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Card className={`relative overflow-hidden h-full p-5 bg-slate-900/60 border-slate-800 backdrop-blur-xl transition-all duration-300 ${stock.hasConvergence ? 'ring-1 ring-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.15)]' : ''}`}>
        
        {/* Subtle background gradient if convergence */}
        {stock.hasConvergence && (
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        )}

        <div className="flex justify-between items-start mb-4 relative z-10">
          <div>
            <h3 className="text-lg font-bold text-slate-100 tracking-tight">{stock.name}</h3>
            <p className="text-xs text-slate-500 font-medium">{stock.symbol} • {stock.sector}</p>
          </div>
          
          <div className="text-right">
            <div className="text-sm font-semibold text-slate-200">
              ₹{stock.currentPrice.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </div>
            <div className={`flex items-center justify-end gap-1 text-xs font-medium ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              <span>{Math.abs(stock.priceChangePercent)}%</span>
            </div>
          </div>
        </div>

        <div className="space-y-3 relative z-10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Recent Signals</span>
            <span className="text-xs font-semibold bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full">
              {stock.signalCount}
            </span>
          </div>
          
          <div className="flex flex-wrap gap-2 min-h-[32px]">
            {stock.signals.length > 0 ? (
              stock.signals.map(signal => (
                <SignalBadge key={signal.id} type={signal.signalType} />
              ))
            ) : (
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Activity className="w-3.5 h-3.5" />
                No active signals
              </div>
            )}
          </div>
        </div>

        {/* AI Insight Section */}
        {stock.signalCount > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-800/50">
            <div className="flex items-center gap-1.5 mb-2">
              <div className="p-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                <Activity className="w-3 h-3 text-indigo-400" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">AI Insight</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-400 line-clamp-2 italic">
              {stock.aiInsight || `Evaluating ${stock.signalCount} recent ${stock.signalCount === 1 ? 'signal' : 'signals'}...`}
            </p>
          </div>
        )}
      </Card>
    </motion.div>
  );
}
