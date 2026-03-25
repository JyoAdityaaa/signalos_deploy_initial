import React from 'react';
import { ConvergenceAlert } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { SignalBadge } from './SignalBadge';
import { TimelineView } from './TimelineView';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Activity, Clock, BarChart } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function AlertCard({ alert, delay = 0 }: { alert: ConvergenceAlert, delay?: number }) {
  const isHighConfidence = alert.confidenceScore >= 80;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4, scale: 1.01 }}
      className="group"
    >
      <Card className={`relative overflow-hidden bg-slate-900/40 backdrop-blur-2xl border border-slate-800/60 p-6 sm:p-8 transition-all duration-500 hover:bg-slate-900/60 ${isHighConfidence ? 'hover:border-indigo-500/30 hover:shadow-[0_0_40px_rgba(99,102,241,0.1)]' : 'hover:border-slate-700'}`}>
        
        {/* Decorative Gradients */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none group-hover:bg-indigo-500/10 transition-colors duration-700" />
        {isHighConfidence && (
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        )}

        <div className="relative z-10 flex flex-col lg:flex-row gap-8">
          {/* Left Column: Core Info */}
          <div className="flex-1 space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-white mb-1 group-hover:text-indigo-50 transition-colors">
                  {alert.stock}
                </h2>
                <div className="flex items-center gap-3 text-sm font-medium text-slate-400">
                  <span className="tracking-wider text-slate-300">{alert.stockSymbol}</span>
                  <span className="w-1 h-1 rounded-full bg-slate-700" />
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {formatDistanceToNow(alert.timestamps[alert.timestamps.length - 1], { addSuffix: true })}
                  </span>
                </div>
              </div>

              {/* Confidence Score Pill */}
              <div className={`flex flex-col items-end px-3 py-1.5 rounded-lg border backdrop-blur-sm ${isHighConfidence ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-slate-800/50 border-slate-700'}`}>
                <div className="flex items-baseline gap-1">
                  <span className={`text-xl font-bold tracking-tighter ${isHighConfidence ? 'text-indigo-400' : 'text-slate-300'}`}>
                    {alert.confidenceScore}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500 uppercase">/100</span>
                </div>
                <span className="text-[9px] font-medium text-slate-400 tracking-widest uppercase">Confidence</span>
              </div>
            </div>

            {/* AI Summary Block */}
            <div className="relative bg-slate-950/50 rounded-xl p-5 border border-slate-800/50">
              <div className="absolute -top-2.5 rtl:left-5 ltr:left-5 text-indigo-400 bg-slate-950 rounded-full p-1 border border-slate-800/50 pl-1 pr-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 ml-1" />
                <span className="text-[9px] font-bold uppercase tracking-widest">AI Synthesis</span>
              </div>
              
              <div className="space-y-3 mt-1">
                {alert.aiSummary.split('. ').map((sentence, idx, arr) => {
                  if (!sentence.trim()) return null;
                  const text = sentence.trim() + (idx < arr.length - 1 && !sentence.endsWith('.') ? '.' : '');
                  return (
                    <p key={idx} className={`text-sm leading-relaxed ${idx === 0 ? 'text-slate-200 font-medium' : 'text-slate-400'}`}>
                      {text}
                    </p>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Signals & Timeline */}
          <div className="lg:w-2/5 flex flex-col gap-6">
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                <BarChart className="w-3.5 h-3.5" />
                Converging Signals ({alert.signals.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {alert.signals.map(signal => (
                  <SignalBadge key={signal.id} type={signal.signalType} />
                ))}
              </div>
            </div>

            <div className="flex-1 bg-slate-900/80 rounded-xl p-5 border border-slate-800/50 flex flex-col">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-2">
                <Activity className="w-3.5 h-3.5" />
                Convergence Window
              </h3>
              <div className="flex-1 flex flex-col justify-center">
                <TimelineView 
                  signals={alert.signals}
                  windowStart={alert.windowStart}
                  windowEnd={alert.windowEnd}
                />
              </div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
