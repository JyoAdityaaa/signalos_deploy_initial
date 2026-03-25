"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Signal, ConvergenceAlert, StockInfo } from '@/lib/types';
import { DEMO_STOCKS } from '@/lib/demo-data';

interface AppContextType {
  isDemoMode: boolean;
  toggleDemoMode: () => void;
  signals: Signal[];
  alerts: ConvergenceAlert[];
  stocks: StockInfo[];
  isLoading: boolean;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  // Demo mode is explicitly true for hackathon
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [alerts, setAlerts] = useState<ConvergenceAlert[]>([]);
  // We use DEMO_STOCKS structure and attach signals dynamically
  const [stocks, setStocks] = useState<StockInfo[]>([...DEMO_STOCKS]);
  const [isLoading, setIsLoading] = useState(true);

  const toggleDemoMode = () => {
    setIsDemoMode(prev => !prev);
  };

  const refreshData = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const ts = Date.now();
      // 1. Fetch Signals
      const sigRes = await fetch(`/api/signals?demo=${isDemoMode}&t=${ts}`, { cache: 'no-store' });
      const sigData = await sigRes.json();
      setSignals(sigData);

      // 2. Fetch Alerts (already computed by convergence engine)
      const alertRes = await fetch(`/api/alerts?demo=${isDemoMode}&t=${ts}`, { cache: 'no-store' });
      const alertData = await alertRes.json();
      setAlerts(alertData);

      // 3. Fetch Stock Insights (AI summaries for all stocks with signals)
      const insightRes = await fetch(`/api/insights?demo=${isDemoMode}&t=${ts}`, { cache: 'no-store' });
      const insightData = await insightRes.json();

      // 4. Update Stocks state with signals, convergence flags, and insights
      setStocks(prev => {
        return prev.map(stock => {
          const stockSignals = sigData.filter((s: Signal) => s.stockSymbol === stock.symbol);
          const hasConvergence = alertData.some((a: ConvergenceAlert) => a.stockSymbol === stock.symbol);
          const aiInsight = insightData[stock.symbol];
          
          return {
            ...stock,
            signals: stockSignals,
            signalCount: stockSignals.length,
            hasConvergence,
            aiInsight
          };
        });
      });
      
    } catch (err) {
      console.error("Failed to fetch data", err);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  // Poll for data in live mode
  useEffect(() => {
    refreshData(false); // Initial load is NOT silent
    
    if (isDemoMode) return;
    
    const interval = setInterval(() => {
      refreshData(true); // Polling IS silent
    }, 15000); // 15s polling for live mode
    
    return () => clearInterval(interval);
  }, [isDemoMode]);

  return (
    <AppContext.Provider
      value={{
        isDemoMode,
        toggleDemoMode,
        signals,
        alerts,
        stocks,
        isLoading,
        refreshData
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
