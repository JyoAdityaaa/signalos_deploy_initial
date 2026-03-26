import { Signal, ConvergenceAlert, SignalType } from './types';
import { liveStore } from './live-store';

// ──────────────────────────────────────────────────────
// SignalOS — In-Memory Convergence Engine (LiveStore)
// ──────────────────────────────────────────────────────
// 
// Thresholds (optimized for live demonstrations):
//   - Min signals for convergence: 2 (instead of 3)
//   - Time window: 72 hours (instead of 24h)
//   - Auto-promote: If a stock has 2+ different signal types
// ──────────────────────────────────────────────────────

const CONVERGENCE_THRESHOLD = 2;       // Min overlapping signals
const TIME_WINDOW_MS = 72 * 60 * 60 * 1000; // 72 hours

/**
 * Runs convergence detection against all signals currently in the LiveStore.
 * Groups signals by stock ticker, checks for time-window overlap and
 * mixed signal types, and generates ConvergenceAlerts.
 */
export function detectLiveConvergences(): ConvergenceAlert[] {
  const allSignals = liveStore.getSignals();
  if (allSignals.length === 0) return [];

  const now = Date.now();
  const cutoff = now - TIME_WINDOW_MS;

  // Filter signals within the 72h window
  const recentSignals = allSignals.filter(s => s.timestamp >= cutoff);

  // Group by stock ticker
  const grouped: Record<string, Signal[]> = {};
  for (const sig of recentSignals) {
    const key = sig.stockSymbol || sig.stock;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(sig);
  }

  const newAlerts: ConvergenceAlert[] = [];

  for (const [ticker, tickerSignals] of Object.entries(grouped)) {
    // Check 1: At least 2 signals in the window
    if (tickerSignals.length < CONVERGENCE_THRESHOLD) continue;

    // Check 2: Determine unique signal types present
    const signalTypes = [...new Set(tickerSignals.map(s => s.signalType))] as SignalType[];
    
    // Check 3: Auto-promote if mixed types (e.g. sentiment + breakout)
    const hasMixedTypes = signalTypes.length >= 2;
    const hasSentimentAndBreakout = signalTypes.includes('news_sentiment') && 
      (signalTypes.includes('technical_breakout') || signalTypes.includes('bulk_deal') || signalTypes.includes('insider_trading'));

    // Either we have enough signals OR we have mixed types
    if (tickerSignals.length >= CONVERGENCE_THRESHOLD || hasMixedTypes || hasSentimentAndBreakout) {
      // Score: base 65 + 10 per extra signal + 15 for mixed types (max 99)
      const baseScore = 65;
      const extraSignalPoints = (tickerSignals.length - CONVERGENCE_THRESHOLD) * 10;
      const mixedBonus = hasMixedTypes ? 15 : 0;
      const confidenceScore = Math.min(99, baseScore + extraSignalPoints + mixedBonus);

      // Sort by timestamp for window edges
      const sorted = [...tickerSignals].sort((a, b) => a.timestamp - b.timestamp);
      const windowStart = sorted[0].timestamp;
      const windowEnd = sorted[sorted.length - 1].timestamp;

      // Determine overall sentiment via majority vote
      const sentimentCounts = { positive: 0, negative: 0, neutral: 0 };
      for (const s of tickerSignals) {
        const sentiment = (s.metadata?.sentiment as string) || 'neutral';
        if (sentiment in sentimentCounts) {
          sentimentCounts[sentiment as keyof typeof sentimentCounts]++;
        }
      }
      const overallSentiment = sentimentCounts.positive >= sentimentCounts.negative ? 'positive' : 'negative';

      // Generate descriptive AI summary
      const typeLabels = signalTypes.map(t => {
        const labels: Record<string, string> = {
          'news_sentiment': 'Sentiment',
          'bulk_deal': 'Bulk Deal',
          'insider_trading': 'Insider',
          'technical_breakout': 'Breakout'
        };
        return labels[t] || t;
      }).join(' + ');

      const alertDesc = `${overallSentiment.toUpperCase()} convergence: ${tickerSignals.length} ${typeLabels} signals detected for ${ticker} within a 72-hour window.`;

      const alert: ConvergenceAlert = {
        id: `conv-${ticker}-${now}`,
        stock: ticker,
        stockSymbol: ticker,
        signals: tickerSignals,
        signalTypes: signalTypes,
        timestamps: sorted.map(s => s.timestamp),
        windowStart: new Date(windowStart).toISOString(),
        windowEnd: new Date(windowEnd).toISOString(),
        confidenceScore,
        aiSummary: alertDesc,
        createdAt: now,
        status: 'active',
      };

      newAlerts.push(alert);
      console.log(`⚡ [CONVERGENCE] New alert for ${ticker}: ${tickerSignals.length} signals, score ${confidenceScore}`);
    }
  }

  return newAlerts;
}

// Legacy stub for components that import from the old engine
export function findConvergences(signals: any[], options?: any): any[] {
  return [];
}
