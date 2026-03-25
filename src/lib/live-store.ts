// ──────────────────────────────────────────
// SignalOS — In-Memory Live Data Store
// ──────────────────────────────────────────

import { Signal, ConvergenceAlert } from './types';

/**
 * Since this is a Next.js app running in a single process during 'npm run dev',
 * a global variable will persist across API calls (until the server restarts).
 * This allows us to simulate a live database for the hackathon.
 */

class LiveStore {
  private static instance: LiveStore;
  private signals: Signal[] = [];
  private alerts: ConvergenceAlert[] = [];
  private stockInsights: Map<string, string> = new Map();

  private constructor() {}

  public static getInstance(): LiveStore {
    if (!LiveStore.instance) {
      LiveStore.instance = new LiveStore();
    }
    return LiveStore.instance;
  }

  // --- Signals ---
  public getSignals(): Signal[] {
    return [...this.signals];
  }

  public addSignals(newSignals: Signal[]) {
    this.signals = [...newSignals, ...this.signals];
  }

  public clearSignals() {
    this.signals = [];
  }

  // --- Alerts ---
  public getAlerts(): ConvergenceAlert[] {
    return [...this.alerts];
  }

  public addAlerts(newAlerts: ConvergenceAlert[]) {
    // Avoid double-counting alerts for the same stock/window if possible
    this.alerts = [...newAlerts, ...this.alerts];
  }

  public updateAlert(id: string, updates: Partial<ConvergenceAlert>) {
    this.alerts = this.alerts.map(a => a.id === id ? { ...a, ...updates } : a);
  }

  public clearAlerts() {
    this.alerts = [];
  }

  // --- Stock Insights (Single signal) ---
  public setStockInsight(symbol: string, insight: string) {
    this.stockInsights.set(symbol, insight);
  }

  public getStockInsights(): Record<string, string> {
    return Object.fromEntries(this.stockInsights);
  }
}

// Persist across HMR in development
const globalForLiveStore = globalThis as unknown as {
  liveStore: LiveStore | undefined;
};

export const liveStore = globalForLiveStore.liveStore ?? LiveStore.getInstance();

if (process.env.NODE_VALUE !== 'production') {
  globalForLiveStore.liveStore = liveStore;
}
