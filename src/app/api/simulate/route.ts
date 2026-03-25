// ──────────────────────────────────────────
// SignalOS — Live Simulator API
// ──────────────────────────────────────────

import { NextResponse, NextRequest } from 'next/server';
import { liveStore } from '@/lib/live-store';
import { Signal, SignalType } from '@/lib/types';
import { DEMO_STOCKS } from '@/lib/demo-data';
import { runConvergenceEngine } from '@/lib/engine-runner';

/**
 * Triggered manually or by a timer to simulate 'Live' signals.
 * Generates 3-5 random but realistic market events.
 */
export async function POST(request: NextRequest) {
  const stocks = DEMO_STOCKS.map(s => ({ name: s.name, symbol: s.symbol }));

  const signalTypes: SignalType[] = ['bulk_deal', 'insider_trading', 'technical_breakout', 'news_sentiment'];
  
  const newsHeadlines = [
    "Q3 earnings beat estimates by 15%",
    "New partnership announced in green energy",
    "Expansion into international markets approved by board",
    "Record volume spike detected in morning session",
    "Institutional accumulation seen in block deals"
  ];

  const count = Math.floor(Math.random() * 5) + 5; // 5-10 signals
  const newSignals: Signal[] = [];

  // FORCE A CONVERGENCE for demo purposes
  const luckyStock = stocks[Math.floor(Math.random() * stocks.length)];
  
  // Choose a random scenario for variety
  const scenarios: SignalType[][] = [
    ['technical_breakout', 'insider_trading'],
    ['bulk_deal', 'technical_breakout'],
    ['news_sentiment', 'technical_breakout'],
    ['insider_trading', 'news_sentiment']
  ];
  const forcedTypes = scenarios[Math.floor(Math.random() * scenarios.length)];
  
  for (const type of forcedTypes) {
    const timestamp = Date.now() - Math.floor(Math.random() * 600000); // within last 10 mins
    newSignals.push({
      id: `live-forced-${luckyStock.symbol}-${type}-${Date.now()}`,
      stock: luckyStock.name,
      stockSymbol: luckyStock.symbol,
      signalType: type,
      date: new Date(timestamp).toISOString().split('T')[0],
      timestamp,
      metadata: {
        description: `High-conviction ${type.replace('_', ' ')} detected for ${luckyStock.name}.`,
        priceAtSignal: 100 + Math.random() * 500,
        volume: 2000000 + Math.floor(Math.random() * 1000000),
      },
      source: 'Institutional Feed',
      lastSuccessTimestamp: Date.now()
    });
  }

  // Add random signals
  for (let i = 0; i < count; i++) {
    const stock = stocks[Math.floor(Math.random() * stocks.length)];
    const type = signalTypes[Math.floor(Math.random() * signalTypes.length)];
    const timestamp = Date.now() - Math.floor(Math.random() * 3600000); // within last hour
    const date = new Date(timestamp).toISOString().split('T')[0];

    const signal: Signal = {
      id: `live-${stock.symbol}-${type}-${Date.now()}-${i}`,
      stock: stock.name,
      stockSymbol: stock.symbol,
      signalType: type,
      date,
      timestamp,
      metadata: {
        description: `Live: ${stock.name} ${type.replace('_', ' ')} detected in real-time.`,
        priceAtSignal: 100 + Math.random() * 500,
        volume: 1000000 + Math.floor(Math.random() * 5000000),
      },
      source: 'Live Stream Ingestor',
      lastSuccessTimestamp: Date.now()
    };

    // Specific metadata for types
    if (type === 'news_sentiment') {
      signal.metadata.newsHeadline = newsHeadlines[Math.floor(Math.random() * newsHeadlines.length)];
      signal.metadata.sentiment = 'positive';
      signal.metadata.newsSource = 'SignalOS Real-time Feed';
    } else if (type === 'bulk_deal') {
      signal.metadata.buyerSeller = 'Institutional Block Buyer';
      signal.metadata.dealSize = `₹${(Math.random() * 500).toFixed(2)} Cr`;
    } else if (type === 'insider_trading') {
      signal.metadata.insiderName = 'Key Management Personnel';
      signal.metadata.transactionType = 'buy';
    } else if (type === 'technical_breakout') {
      signal.metadata.volumeMultiple = 2.5 + Math.random() * 3;
      signal.metadata.maValue = signal.metadata.priceAtSignal! * 0.95;
    }

    newSignals.push(signal);
  }

  liveStore.addSignals(newSignals);

  // Trigger convergence engine natively (this avoids unreliable loopback fetches)
  let alertsCount = 0;
  try {
    const convergences = await runConvergenceEngine(false);
    alertsCount = convergences.length;
  } catch (err) {
    console.error("Failed to run convergence engine directly", err);
  }

  return NextResponse.json({
    message: `Generated ${count} live signals`,
    signalsCount: newSignals.length,
    alertsCreated: alertsCount
  });
}

// GET to clear or status
export async function GET() {
    return NextResponse.json({
        signalsCount: liveStore.getSignals().length,
        alertsCount: liveStore.getAlerts().length,
        status: 'Simulator Active'
    });
}
