import React from 'react';
import { Signal, SIGNAL_CONFIG } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

export function LiveFeedItem({ signal }: { signal: Signal }) {
  const config = SIGNAL_CONFIG[signal.signalType];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      layout
    >
      <Card className="flex items-start gap-4 p-4 bg-slate-900/60 border-slate-800/80 backdrop-blur-md hover:bg-slate-800/50 transition-colors">
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${config.bgColor} ${config.color} border ${config.borderColor} shadow-inner`}>
          <config.icon className="w-5 h-5" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h4 className="text-sm font-bold text-slate-200 truncate">
              {signal.stock} <span className="text-slate-500 font-medium">({signal.stockSymbol})</span>
            </h4>
            <span className="text-[10px] font-medium text-slate-500 whitespace-nowrap">
              {formatDistanceToNow(signal.timestamp, { addSuffix: true })}
            </span>
          </div>
          
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-[10px] uppercase tracking-wider font-bold ${config.color}`}>
              {config.label}
            </span>
            <span className="w-1 h-1 rounded-full bg-slate-700" />
            <span className="text-xs text-slate-400 capitalize">
              Source: {signal.source}
            </span>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
            {signal.metadata.description}
          </p>
        </div>
      </Card>
    </motion.div>
  );
}
