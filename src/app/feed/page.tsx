"use client";

import { useEffect, useState } from 'react';
import { useAppContext } from '@/components/AppContext';
import { LiveFeedItem } from '@/components/LiveFeedItem';
import { Signal } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio } from 'lucide-react';

export default function FeedPage() {
  const { signals, isLoading } = useAppContext();
  const [visibleSignals, setVisibleSignals] = useState<Signal[]>([]);

  // Simulate a live feed by dropping in signals one by one
  useEffect(() => {
    if (isLoading || signals.length === 0) return;

    // Reset
    setVisibleSignals([]);
    
    // Sort ascending by time initially for the stream simulation
    const sorted = [...signals].sort((a, b) => a.timestamp - b.timestamp);
    
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < sorted.length) {
        // Add to the TOP of the visible list
        setVisibleSignals(prev => [sorted[currentIndex], ...prev]);
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 800); // 800ms between each signal for demo effect

    return () => clearInterval(interval);
  }, [signals, isLoading]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 rounded-full border-t-2 border-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2 flex items-center gap-3">
            <Radio className="w-8 h-8 text-indigo-400 animate-pulse" />
            Live Intelligence Feed
          </h1>
          <p className="text-sm text-slate-400">
            Real-time stream of parsed signals waiting for convergence engine evaluation.
          </p>
        </div>
        
        <div className="flex items-end gap-2 pr-4">
          <div className="flex gap-1 items-center h-4">
            <motion.div animate={{ height: ["4px", "12px", "4px"] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1 bg-indigo-500 rounded-full" />
            <motion.div animate={{ height: ["4px", "16px", "4px"] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.2 }} className="w-1 bg-indigo-500 rounded-full" />
            <motion.div animate={{ height: ["4px", "10px", "4px"] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.4 }} className="w-1 bg-indigo-500 rounded-full" />
          </div>
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">{visibleSignals.length} Active</span>
        </div>
      </div>

      <div className="relative">
        <div className="absolute top-0 bottom-0 left-5 w-px bg-slate-800" />
        
        <div className="space-y-4 pl-[42px]">
          <AnimatePresence>
            {visibleSignals.filter(Boolean).map((sig) => (
              <div key={sig.id} className="relative">
                <div className="absolute top-1/2 -translate-y-1/2 -left-[42px] w-4 h-px bg-slate-800" />
                <LiveFeedItem signal={sig} />
              </div>
            ))}
          </AnimatePresence>
          
          {visibleSignals.length === 0 && (
            <div className="text-sm text-slate-500 italic pt-4">
              Waiting for incoming signals...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
