import { findConvergences } from '@/lib/convergence-engine';
import { generateAISummary } from '@/lib/ai-summary';
import { DEMO_SIGNALS } from '@/lib/demo-data';
import { liveStore } from '@/lib/live-store';
import { Signal, ConvergenceAlert } from '@/lib/types';

export async function runConvergenceEngine(isDemo: boolean = false) {
  let signalsToProcess: Signal[] = [];

  if (isDemo) {
    signalsToProcess = DEMO_SIGNALS;
  } else {
    signalsToProcess = liveStore.getSignals();
  }

  console.log(`📡 [SignalOS] Engine Runner: Processing ${signalsToProcess.length} signals (Mode: ${isDemo ? 'Demo' : 'Live'})`);

  // Run engine
  const convergences = findConvergences(signalsToProcess, { filterStale: !isDemo });
  console.log(`🔍 [SignalOS] Convergence Engine: Found ${convergences.length} alerts for ${signalsToProcess.length} signals.`);

  // Generate AI Summaries for any alert that doesn't have one
  for (const conv of convergences) {
    if (!conv.aiSummary) {
      console.log(`Generating AI Summary for ${conv.stockSymbol}...`);
      conv.aiSummary = await generateAISummary(conv);
    }
  }

  // Generate single-signal insights for stocks that don't have a convergence
  if (!isDemo) {
    const stocksWithSignals = new Set(signalsToProcess.map(s => s.stockSymbol));
    const stocksWithConvergences = new Set(convergences.map(c => c.stockSymbol));

    for (const symbol of stocksWithSignals) {
      if (!stocksWithConvergences.has(symbol)) {
        const stockSignals = signalsToProcess.filter(s => s.stockSymbol === symbol);
        const latestSignal = stockSignals.sort((a, b) => b.timestamp - a.timestamp)[0];
        const insight = await generateAISummary(latestSignal);
        liveStore.setStockInsight(symbol, insight);
      }
    }
    
    // Also store convergence summaries as stock insights
    for (const conv of convergences) {
      liveStore.setStockInsight(conv.stockSymbol, conv.aiSummary);
    }

    liveStore.addAlerts(convergences);
  }

  return convergences;
}
