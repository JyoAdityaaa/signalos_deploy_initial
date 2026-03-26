import { NextResponse } from 'next/server';
import Parser from 'rss-parser';
import { processNewsIntoSignals } from '@/lib/ai-signal-processor';
import { detectLiveConvergences } from '@/lib/convergence-engine';
import { liveStore } from '@/lib/live-store';
import { Signal } from '@/lib/types';

export const dynamic = 'force-dynamic';

const parser = new Parser();

const SEED_TICKERS = [
  'RELIANCE.NS',
  'HDFCBANK.NS',
  'BAJAJ-AUTO.NS',
  'TCS.NS',
  'INFY.NS'
];

const withTimeout = <T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> => {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<T>((resolve) => {
    timer = setTimeout(() => resolve(fallback), ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timer));
};

export async function GET() {
  try {
    const aggregatedData = [];

    for (const ticker of SEED_TICKERS) {
      
      // 1. Fetch Quote Data
      let quote: any = { price: 0, previousClose: 0, volume: 0 };
      try {
        const yfUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1d`;
        const fetchQuoteTask = fetch(yfUrl, { next: { revalidate: 0 } }).then(res => {
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
          return res.json();
        });
        
        const quoteResult = await withTimeout(fetchQuoteTask, 6000, null);
        
        if (quoteResult?.chart?.result?.length > 0) {
          const meta = quoteResult.chart.result[0].meta;
          const indicators = quoteResult.chart.result[0].indicators;
          const volume = indicators?.quote?.[0]?.volume?.[0] ?? 0;
          
          quote = {
            price: meta.regularMarketPrice ?? 0,
            previousClose: meta.chartPreviousClose ?? meta.previousClose ?? 0,
            volume: volume,
          };
        }
      } catch (error: any) {
        console.warn(`[INGEST] Quote fetch failed for ${ticker}:`, error.message);
      }

      // 2. Fetch Recent News via Google News RSS
      let news: { title?: string; link?: string; pubDate?: string }[] = [];
      try {
        const searchName = ticker.replace('.NS', '');
        const rssUrl = `https://news.google.com/rss/search?q=${searchName}+stock+India&hl=en-IN&gl=IN&ceid=IN:en`;
        const newsResult = await withTimeout(parser.parseURL(rssUrl), 5000, null);

        if (newsResult?.items) {
          news = newsResult.items.slice(0, 3).map(item => ({
            title: item.title,
            link: item.link,
            pubDate: item.pubDate,
          }));
        }
      } catch (error) {
        console.warn(`[INGEST] News fetch failed for ${ticker}`);
      }

      // 3. Process News into Trading Signals using Gemini
      let signals: any[] = [];
      try {
        if (news.length > 0 && quote.price > 0) {
          signals = await processNewsIntoSignals(news, ticker);
          
          // Convert AI output into proper Signal objects and store in LiveStore
          const now = Date.now();
          const liveSignals: Signal[] = signals.map((sig: any, idx: number) => ({
            id: `live-${ticker}-${now}-${idx}`,
            stock: ticker,
            stockSymbol: ticker,
            signalType: sig.signalType || 'news_sentiment',
            sentiment: sig.sentiment || 'neutral',
            date: new Date(now).toISOString(),
            timestamp: now,
            source: 'Google News + Gemini AI',
            lastSuccessTimestamp: now,
            metadata: {
              description: sig.description || `Signal for ${ticker}`,
              newsUrl: news[0]?.link || '',
              sentiment: sig.sentiment || 'neutral',
              confidenceScore: sig.confidenceScore || 50,
            }
          }));

          // CRITICAL: Store signals in LiveStore so all pages can read them
          if (liveSignals.length > 0) {
            liveStore.addSignals(liveSignals);
            console.log(`✅ [INGEST] Stored ${liveSignals.length} signals for ${ticker} in LiveStore`);
          }
        } else {
          console.warn(`[INGEST] Skipping AI for ${ticker}: price=${quote.price}, news=${news.length}`);
        }
      } catch (error) {
        console.warn(`[INGEST] AI Signal Processing failed for ${ticker}:`, error);
      }

      aggregatedData.push({ ticker, quote, signals, news });

      // DELAY: Wait 8 seconds between tickers for Gemini free tier
      await new Promise(resolve => setTimeout(resolve, 8000));
    }

    // ── POST-INGESTION: Run Convergence Detection ──
    // Scan all signals in LiveStore for convergences (2+ signals in 72h window)
    const convergenceAlerts = detectLiveConvergences();
    if (convergenceAlerts.length > 0) {
      liveStore.clearAlerts(); // Clear stale alerts
      liveStore.addAlerts(convergenceAlerts);
      console.log(`⚡ [CONVERGENCE] Detected ${convergenceAlerts.length} convergence alerts across all tickers`);
    }

    return NextResponse.json({
      status: 'success',
      timestamp: new Date().toISOString(),
      signalsStored: liveStore.getSignals().length,
      convergencesDetected: convergenceAlerts.length,
      data: aggregatedData
    });
  } catch (error: any) {
    console.error('[INGEST ERROR]', error);
    return NextResponse.json(
      { status: 'error', message: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
