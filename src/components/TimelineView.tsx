import React from 'react';
import { Signal, SIGNAL_CONFIG } from '@/lib/types';
import { format } from 'date-fns';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function TimelineView({ signals, windowStart, windowEnd }: { signals: Signal[], windowStart: string, windowEnd: string }) {
  const startTs = new Date(windowStart).getTime();
  const endTs = new Date(windowEnd).getTime();
  const totalDuration = Math.max(endTs - startTs, 1);

  const sorted = [...signals].sort((a, b) => a.timestamp - b.timestamp);

  return (
    <TooltipProvider>
      <div className="relative pt-8 pb-4 w-full mt-4">
        {/* Background Track */}
        <div className="absolute top-10 left-0 w-full h-1.5 bg-slate-800/50 rounded-full" />
        
        {/* Active Range Highlight */}
        <div className="absolute top-10 left-0 h-1.5 bg-indigo-500/30 rounded-full" style={{ width: '100%' }} />

        {/* Signals */}
        {sorted.map((sig) => {
          let percent = ((sig.timestamp - startTs) / totalDuration) * 100;
          percent = Math.max(0, Math.min(percent, 100));
          const config = SIGNAL_CONFIG[sig.signalType];

          return (
            <div 
              key={sig.id} 
              className="absolute top-10 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center group cursor-pointer z-10"
              style={{ left: `${percent}%` }}
            >
              <Tooltip>
                <TooltipTrigger>
                  <div className="relative">
                    {/* The Node */}
                    <div className={`w-4 h-4 rounded-full border-2 border-slate-900 ${config.bgColor.replace('/10', '')} ring-2 ring-transparent group-hover:ring-white/20 group-hover:scale-125 transition-all shadow-[0_0_10px_rgba(0,0,0,0.5)]`} />
                    
                    {/* Icon Above */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-slate-400 z-20 transition-all opacity-0 group-hover:opacity-100 group-hover:-translate-y-1 pb-1">
                      <config.icon className="w-4 h-4" />
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="bg-slate-900 border-slate-700 text-slate-200 p-6 shadow-2xl">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <config.icon className={`w-4 h-4 ${config.color}`} />
                      <span className="font-bold text-sm tracking-tight">{config.label}</span>
                    </div>
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                      {format(sig.timestamp, 'MMM d, p')}
                    </span>
                    <p className="text-xs text-slate-400 mt-1 max-w-[200px] leading-relaxed">
                      {sig.metadata.description}
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </div>
          );
        })}

        {/* Axis Labels */}
        <div className="flex justify-between mt-8 text-[10px] text-slate-500 font-bold tracking-widest uppercase">
          <div className="flex flex-col items-start gap-1">
            <div className="w-px h-2 bg-slate-800" />
            <span>{format(startTs, 'MMM dd')}</span>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="w-px h-2 bg-slate-800" />
            <span>{format(endTs, 'MMM dd')}</span>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
