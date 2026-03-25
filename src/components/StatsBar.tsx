"use client";

import { useAppContext } from './AppContext';
import { Card } from '@/components/ui/card';
import { Zap, Activity, BarChart2 } from 'lucide-react';
import { motion } from 'framer-motion';

export function StatsBar() {
  const { alerts, stocks, signals } = useAppContext();
  
  const activeStocks = stocks.filter(s => s.hasConvergence).length;
  
  const stats = [
    {
      label: 'Convergences Detected',
      value: alerts.length,
      icon: Zap,
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10'
    },
    {
      label: 'Active Signals',
      value: signals.length,
      icon: Activity,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10'
    },
    {
      label: 'Monitored Stocks',
      value: stocks.length,
      icon: BarChart2,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10'
    }
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
    >
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <motion.div key={stat.label} variants={item}>
            <Card className="p-5 bg-slate-900/40 border-slate-800/60 backdrop-blur-xl flex items-center justify-between group hover:bg-slate-900/60 transition-colors cursor-default">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  {stat.label}
                </p>
                <p className="text-3xl font-bold tracking-tighter text-slate-100">
                  {stat.value}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                <Icon className="w-6 h-6" />
              </div>
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
