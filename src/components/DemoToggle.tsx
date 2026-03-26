"use client";

import { useAppContext } from './AppContext';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { PlayCircle, Database, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

export function DemoToggle() {
  const { isDemoMode, toggleDemoMode, refreshData } = useAppContext();
  const [isSimulating, setIsSimulating] = useState(false);

  const handleSimulate = async () => {
    setIsSimulating(true);
    try {
      const res = await fetch('/api/simulate', { method: 'POST' });
      if (res.ok) {
        await refreshData();
      }
    } catch (err) {
      console.error("Simulation failed", err);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="flex items-center space-x-4">
      {!isDemoMode && (
        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={handleSimulate}
          disabled={isSimulating}
          className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-400 text-xs font-bold hover:bg-emerald-500/20 transition-all disabled:opacity-50"
        >
          <Zap className={`w-3.5 h-3.5 ${isSimulating ? "animate-pulse" : ""}`} />
          {isSimulating ? "SIMULATING..." : "SIMULATE LIVE"}
        </motion.button>
      )}

      {/* Toggle with Tooltip */}
      <div className="relative group">
        <div className={`flex items-center space-x-3 rounded-full px-3 py-1.5 backdrop-blur-md border transition-colors duration-300 ${
          isDemoMode 
            ? 'bg-amber-950/30 border-amber-800/40' 
            : 'bg-slate-900/50 border-slate-800'
        }`}>
          <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase">
            <Database className="w-3.5 h-3.5 text-slate-400" />
            <span className={!isDemoMode ? "text-emerald-400" : "text-slate-500"}>Live</span>
          </div>
          
          <Switch 
            checked={isDemoMode}
            onCheckedChange={toggleDemoMode}
            className={`transition-colors ${isDemoMode ? 'data-[state=checked]:bg-amber-500' : 'data-[state=unchecked]:bg-slate-700'}`}
          />
          
          <div className="flex items-center gap-1.5">
            <span className={`text-xs font-semibold tracking-wider uppercase ${isDemoMode ? "text-amber-400" : "text-slate-500"}`}>
              Demo
            </span>
            {isDemoMode && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex h-2 w-2 rounded-full bg-amber-500"
                style={{ boxShadow: "0 0 10px #f59e0b" }}
              />
            )}
          </div>
        </div>

        {/* Tooltip */}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-[10px] text-slate-300 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none shadow-xl z-50">
          Switching to Live fetches real-time NSE data; Demo uses historical patterns.
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 border-r border-b border-slate-700 rotate-45 -mt-1"></div>
        </div>
      </div>
    </div>
  );
}
