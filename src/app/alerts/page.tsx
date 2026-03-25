"use client";

import { useAppContext } from '@/components/AppContext';
import { AlertCard } from '@/components/AlertCard';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

export default function AlertsPage() {
  const { alerts, isLoading } = useAppContext();

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
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="flex flex-col items-center justify-center p-12 bg-slate-900/40 rounded-2xl border border-slate-800/50 backdrop-blur-sm"
            >
              <AlertCircle className="w-12 h-12 text-slate-600 mb-4" />
              <h3 className="text-lg font-medium text-slate-300">No Convergences Detected</h3>
              <p className="text-sm text-slate-500 mt-1 max-w-sm text-center">
                The engine has not found any multiple-signal convergences in the current active window.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
