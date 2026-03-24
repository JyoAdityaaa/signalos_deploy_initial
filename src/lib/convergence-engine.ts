// ──────────────────────────────────────────
// SignalOS — Convergence Engine
// ──────────────────────────────────────────

import { Signal, ConvergenceAlert } from './types';

const CONVERGENCE_WINDOW_DAYS = 7;
const STALE_THRESHOLD_HOURS = 48;
const MS_PER_DAY = 86400000;

/**
 * Groups signals by stock, then checks for ≥2 distinct
 * signal types within a 7-day window.
 */
export function findConvergences(
  signals: Signal[],
  options: { filterStale?: boolean } = {}
): ConvergenceAlert[] {
  const { filterStale = false } = options;

  let filtered = signals;
  if (filterStale) {
    const staleThreshold = Date.now() - STALE_THRESHOLD_HOURS * 3600000;
    filtered = signals.filter(s => s.lastSuccessTimestamp >= staleThreshold);
  }

  // Group by stock symbol
  const grouped: Record<string, Signal[]> = {};
  for (const signal of filtered) {
    if (!grouped[signal.stockSymbol]) {
      grouped[signal.stockSymbol] = [];
    }
    grouped[signal.stockSymbol].push(signal);
  }

  const alerts: ConvergenceAlert[] = [];

  for (const [symbol, stockSignals] of Object.entries(grouped)) {
    // Need at least 2 signals
    if (stockSignals.length < 2) continue;

    // Sort by timestamp
    const sorted = [...stockSignals].sort((a, b) => a.timestamp - b.timestamp);

    // Sliding window: check if any window of CONVERGENCE_WINDOW_DAYS
    // contains ≥2 distinct signal types
    for (let i = 0; i < sorted.length; i++) {
      const windowStart = sorted[i].timestamp;
      const windowEnd = windowStart + CONVERGENCE_WINDOW_DAYS * MS_PER_DAY;

      const windowSignals = sorted.filter(
        s => s.timestamp >= windowStart && s.timestamp <= windowEnd
      );

      const uniqueTypes = new Set(windowSignals.map(s => s.signalType));

      if (uniqueTypes.size >= 2) {
        // Avoid duplicate alerts for same stock
        const existingAlert = alerts.find(a => a.stockSymbol === symbol);
        if (!existingAlert) {
          alerts.push({
            id: `alert-${symbol.toLowerCase()}-${Date.now()}`,
            stock: sorted[0].stock,
            stockSymbol: symbol,
            signals: windowSignals,
            signalTypes: Array.from(uniqueTypes),
            timestamps: windowSignals.map(s => s.timestamp),
            windowStart: new Date(windowStart).toISOString().split('T')[0],
            windowEnd: new Date(
              Math.max(...windowSignals.map(s => s.timestamp))
            ).toISOString().split('T')[0],
            confidenceScore: calculateConfidence(windowSignals),
            aiSummary: '', // To be filled by AI layer
            createdAt: Date.now(),
            status: 'active',
          });
        }
        break; // Move to next stock
      }
    }
  }

  // Sort by confidence score descending
  return alerts.sort((a, b) => b.confidenceScore - a.confidenceScore);
}

/**
 * Confidence score: 0–100 based on signal count,
 * type diversity, recency, and volume.
 */
export function calculateConfidence(signals: Signal[]): number {
  let score = 0;

  // Signal count (max 40 points)
  const countScore = Math.min(signals.length * 15, 40);
  score += countScore;

  // Type diversity (max 30 points)
  const uniqueTypes = new Set(signals.map(s => s.signalType));
  const diversityScore = Math.min(uniqueTypes.size * 10, 30);
  score += diversityScore;

  // Recency — how recent is the latest signal (max 20 points)
  const latestTimestamp = Math.max(...signals.map(s => s.timestamp));
  const daysSinceLatest = (Date.now() - latestTimestamp) / MS_PER_DAY;
  if (daysSinceLatest < 1) score += 20;
  else if (daysSinceLatest < 3) score += 15;
  else if (daysSinceLatest < 7) score += 10;
  else if (daysSinceLatest < 14) score += 5;

  // Window tightness — closer signals = higher confidence (max 10 points)
  const earliestTimestamp = Math.min(...signals.map(s => s.timestamp));
  const windowDays = (latestTimestamp - earliestTimestamp) / MS_PER_DAY;
  if (windowDays <= 2) score += 10;
  else if (windowDays <= 4) score += 7;
  else if (windowDays <= 7) score += 4;

  return Math.min(score, 100);
}
