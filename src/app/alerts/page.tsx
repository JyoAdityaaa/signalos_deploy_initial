"use client";

import { useAppContext } from '@/components/AppContext';
import { AlertCard } from '@/components/AlertCard';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Activity, Lightbulb, Zap, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Signal, SIGNAL_CONFIG } from '@/lib/types';

export default function AlertsPage() {
  const { alerts, isLoading, isDemoMode } = useAppContext();
  
  const [pulseData, setPulseData] = useState<{ summary: string | null, signals: Signal[], isHistorical?: boolean }>({ summary: null, signals: [] });
  const [isPulseLoading, setIsPulseLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchPulse = async () => {
    try {
      setIsPulseLoading(true);
      const res = await fetch(`/api/alerts/pulse?demo=${isDemoMode}`);
      const data = await res.json();
      setPulseData(data);
    } catch (err) {
      console.error("Failed to load pulse", err);
    } finally {
      setIsPulseLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoading && alerts.length === 0) {
      fetchPulse();
    }
  }, [isLoading, alerts.length, isDemoMode]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetch('/api/ingest');
      await fetchPulse();
    } catch (err) {
      console.error("Failed manual refresh", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 rounded-full border-t-2 border-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">Convergence Intel</h1>
          <p className="text-sm text-slate-400 max-w-2xl">
            High-probability opportunities identified by the SignalOS convergence engine. 
            These events occur when 2 or more independent signals overlap within a 7-day window.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <AnimatePresence>
          {alerts.length > 0 ? (
            alerts.map((alert, idx) => (
              <AlertCard key={alert.id} alert={alert} delay={idx * 0.15} />
            ))
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="flex flex-col gap-6"
            >
              <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800/50 backdrop-blur-sm">
                
                {/* 1. Pulse Animation Header */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800/50">
                  <div className="flex items-center gap-3">
                    <div className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500 animate-pulse"></span>
                    </div>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-indigo-400">
                      {pulseData.isHistorical ? 'LATEST RECORDED ACTIVITY' : 'SCANNING LIVE MARKETS'}
                    </h3>
                  </div>

                  {/* Manual Refresh Trigger */}
                  <button 
                    onClick={handleManualRefresh}
                    disabled={isRefreshing || isPulseLoading}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 text-xs font-bold text-slate-300 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                    Refresh Pulse
                  </button>
                </div>

                {/* Loading State / Skeleton Loader */}
                {isPulseLoading && (
                  <div className="animate-pulse space-y-6">
                    <div className="h-24 bg-slate-800/30 rounded-xl" />
                    <div className="space-y-3">
                      <div className="h-6 w-48 bg-slate-800/50 rounded" />
                      <div className="h-20 bg-slate-800/20 rounded-xl" />
                      <div className="h-20 bg-slate-800/20 rounded-xl" />
                      <div className="h-20 bg-slate-800/20 rounded-xl" />
                    </div>
                  </div>
                )}

                {!isPulseLoading && pulseData.signals.length === 0 ? (
                  // Syncing State — shown while waiting for first real data
                  <div className="flex flex-col items-center justify-center py-12 text-center bg-slate-900/20 rounded-xl border border-slate-800/50">
                    <div className="relative flex h-12 w-12 mb-6">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-20"></span>
                      <div className="relative flex items-center justify-center rounded-full h-12 w-12 bg-slate-900 border border-emerald-500/30">
                         <Activity className="w-6 h-6 text-emerald-400 animate-pulse" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-slate-200 mb-2">Syncing with NSE / BSE...</h3>
                    <p className="text-sm text-slate-400 max-w-md mb-6">
                      Connecting to live market feeds and intelligence sources. This may take a moment on first run.
                    </p>
                    {/* Animated Progress Bar */}
                    <div className="w-64 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-emerald-500 via-indigo-500 to-emerald-500 rounded-full animate-pulse" style={{ width: '60%', animation: 'pulse 1.5s ease-in-out infinite' }} />
                    </div>
                    <p className="text-xs text-slate-500 mt-3">Click <strong>Refresh Pulse</strong> above to fetch immediately</p>
                  </div>
                ) : !isPulseLoading && (
                  <>
                    {/* 2. AI Market Pulse Summary */}
                    {pulseData.summary && (
                      <div className="bg-indigo-500/10 border border-indigo-500/20 p-5 rounded-xl mb-6">
                        <div className="flex gap-3">
                          <Lightbulb className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="text-sm font-semibold text-indigo-300 mb-1">AI Market Sentiment Summary</h4>
                            <p className="text-sm text-slate-300 leading-relaxed font-medium">{pulseData.summary}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 3. Emerging Intel Cards */}
                    <div>
                      <h4 className="text-slate-300 font-semibold mb-4 text-sm flex items-center gap-2">
                        <Activity className="w-4 h-4 text-slate-500" />
                        Emerging Intel (Awaiting Convergence)
                      </h4>
                      <div className="grid gap-3">
                        {pulseData.signals.map((sig, idx) => {
                          const config = SIGNAL_CONFIG[sig.signalType] || SIGNAL_CONFIG.news_sentiment;
                          const Icon = config.icon || Zap;
                          return (
                            <motion.div 
                              key={`${sig.stockSymbol || sig.stock}-${sig.timestamp}-${idx}`}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.1 }}
                              className="relative flex items-start gap-4 p-4 rounded-xl bg-slate-950/40 border border-slate-800/40 hover:border-slate-700/60 transition-colors overflow-hidden group"
                            >
                               <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2 py-0.5 bg-red-500/10 border border-red-500/20 rounded-full">
                                  <span className="relative flex h-1.5 w-1.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
                                  </span>
                                  <span className="text-[9px] font-bold text-red-400 uppercase tracking-widest">Live</span>
                               </div>
                            
                               <div className={`p-2 rounded-lg ${config.bgColor} ${config.color} mt-1`}>
                                  <Icon className="w-4 h-4" />
                               </div>
                               <div className="pr-12 w-full">
                                  <div className="flex items-center gap-2 mb-1">
                                     <span className="font-bold text-white tracking-wide">{sig.stockSymbol || sig.stock}</span>
                                     <span className={`text-[10px] px-2 py-0.5 rounded-full bg-slate-800 font-semibold ${config.color}`}>{config.label}</span>
                                  </div>
                                  <p className="text-sm text-slate-400 mb-3">{sig.metadata.description}</p>
                                  {(sig.metadata as any).newsUrl && (
                                     <a 
                                       href={(sig.metadata as any).newsUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center text-[10px] font-bold text-slate-400 hover:text-indigo-400 uppercase tracking-widest transition-colors duration-200"
                                     >
                                       Read Source Article ↗
                                     </a>
                                  )}
                               </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
