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
  // Default to LIVE mode — real data first
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [alerts, setAlerts] = useState<ConvergenceAlert[]>([]);
  const [stocks, setStocks] = useState<StockInfo[]>([]);
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
      setSignals(Array.isArray(sigData) ? sigData : []);

      // 2. Fetch Alerts
      const alertRes = await fetch(`/api/alerts?demo=${isDemoMode}&t=${ts}`, { cache: 'no-store' });
      const alertData = await alertRes.json();
      setAlerts(Array.isArray(alertData) ? alertData : []);

      // 3. Fetch Insights
      const insightRes = await fetch(`/api/insights?demo=${isDemoMode}&t=${ts}`, { cache: 'no-store' });
      const insightData = await insightRes.json();

      // 4. Build stocks list based on mode
      if (isDemoMode) {
        // Demo Mode: use exact matches
        const updatedStocks = [...DEMO_STOCKS].map(stock => {
          const stockSignals = sigData.filter((s: Signal) => s.stockSymbol === stock.symbol);
          const hasConvergence = alertData.some((a: ConvergenceAlert) => a.stockSymbol === stock.symbol);
          const aiInsight = insightData[stock.symbol];
          return {
            ...stock,
            signals: stockSignals,
            signalCount: stockSignals.length,
            hasConvergence,
            aiInsight,
          };
        });
        setStocks(updatedStocks);
      } else {
        // Live Mode: Use the full realistic stock list, but strip .NS suffix from live data to match
        const liveStocks = [...DEMO_STOCKS].map(stock => {
          const stockSignals = sigData.filter((s: Signal) => 
            s.stockSymbol === stock.symbol || s.stockSymbol.replace('.NS', '') === stock.symbol
          );
          
          const hasConvergence = alertData.some((a: ConvergenceAlert) => 
            a.stockSymbol === stock.symbol || a.stockSymbol.replace('.NS', '') === stock.symbol
          );
          
          const aiInsight = insightData[stock.symbol] || insightData[`${stock.symbol}.NS`];
          
          return {
            ...stock,
            signals: stockSignals,
            signalCount: stockSignals.length,
            hasConvergence,
            aiInsight,
          };
        });
        
        // Sort the live stocks so that monitored ones (with signals) bubble up to the top
        const sortedLiveStocks = [...liveStocks].sort((a, b) => b.signalCount - a.signalCount);
        setStocks(sortedLiveStocks);
      }
      
    } catch (err) {
      console.error("Failed to fetch data", err);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  // Poll for data in live mode
  useEffect(() => {
    refreshData(false);
    
    if (isDemoMode) return;
    
    const interval = setInterval(() => {
      refreshData(true);
    }, 15000);
    
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
