"use client";

import { useState, useMemo } from 'react';
import { StatsBar } from '@/components/StatsBar';
import { StockCard } from '@/components/StockCard';
import { useAppContext } from '@/components/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, X } from 'lucide-react';

export default function DashboardPage() {
  const { stocks, isLoading } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSector, setActiveSector] = useState('All');

  const sectors = useMemo(() => {
    const s = new Set(stocks.map(stock => stock.sector));
    return ['All', ...Array.from(s).sort()];
  }, [stocks]);

  const filteredStocks = useMemo(() => {
    return stocks.filter(stock => {
      const matchesSearch = 
        stock.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        stock.symbol.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSector = activeSector === 'All' || stock.sector === activeSector;
      return matchesSearch && matchesSector;
    });
  }, [stocks, searchTerm, activeSector]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 rounded-full border-t-2 border-indigo-500 animate-spin" />
      </div>
    );
  }

  // Active stocks first, then the rest
  const sortedStocks = [...filteredStocks].sort((a, b) => {
    if (a.hasConvergence === b.hasConvergence) {
      if (a.signalCount !== b.signalCount) return b.signalCount - a.signalCount;
      return a.name.localeCompare(b.name);
    }
    return a.hasConvergence ? -1 : 1;
  });

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Intelligence Overview</h1>
          <p className="mt-2 text-sm text-slate-400 max-w-2xl">
            Real-time monitoring across {stocks.length} high-volume NSE equities. Stocks with active convergence alerts are highlighted.
          </p>
        </div>

        <div className="relative group max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
          <input 
            type="text"
            placeholder="Search stock or symbol..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900/50 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all backdrop-blur-sm"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-slate-800 text-slate-500 hover:text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <StatsBar />

      {/* Sector Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-500 uppercase tracking-widest border-r border-slate-800 mr-1">
          <Filter className="w-3 h-3" />
          Sectors:
        </div>
        {sectors.map(sector => (
          <button
            key={sector}
            onClick={() => setActiveSector(sector)}
            className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
              activeSector === sector 
                ? "bg-indigo-500 border-indigo-400 text-white shadow-lg shadow-indigo-500/20" 
                : "bg-slate-900/40 border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-300"
            }`}
          >
            {sector}
          </button>
        ))}
      </div>

      <motion.div 
        layout
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <AnimatePresence mode='popLayout'>
          {sortedStocks.map(stock => (
            <motion.div
              key={stock.symbol}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <StockCard stock={stock} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {sortedStocks.length === 0 && (
        <div className="flex flex-col items-center justify-center p-20 bg-slate-900/20 border border-dashed border-slate-800 rounded-3xl">
          <p className="text-slate-500 font-medium">No stocks matched your search or filters.</p>
          <button 
            onClick={() => { setSearchTerm(''); setActiveSector('All'); }}
            className="mt-4 text-indigo-400 hover:text-indigo-300 text-sm font-bold"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
