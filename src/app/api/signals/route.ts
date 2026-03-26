import { NextResponse, NextRequest } from 'next/server';
export const dynamic = 'force-dynamic';
import { DEMO_SIGNALS } from '@/lib/demo-data';
import { liveStore } from '@/lib/live-store';
import Parser from 'rss-parser';

const parser = new Parser();
const TARGET_TICKERS = ['RELIANCE', 'HDFCBANK', 'TCS', 'INFY', 'BAJAJ-AUTO'];

async function fetchLiveNewsFallback(): Promise<any[]> {
  const fallbackSignals: any[] = [];
  for (const ticker of TARGET_TICKERS) {
    try {
      const rssUrl = `https://news.google.com/rss/search?q=${ticker}+stock+India&hl=en-IN&gl=IN&ceid=IN:en`;
      const feedPromise = parser.parseURL(rssUrl);
      const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 3000));
      const feed = await Promise.race([feedPromise, timeoutPromise]);

      if (feed && feed.items && feed.items.length > 0) {
        const item = feed.items[0]; // Just take 1 per ticker for the feed
        fallbackSignals.push({
          id: `live-fallback-${ticker}-${Date.now()}`,
          stock: `${ticker}.NS`,
          stockSymbol: `${ticker}.NS`,
          signalType: 'news_sentiment',
          sentiment: 'neutral',
          date: new Date(item.pubDate || Date.now()).toISOString(),
          timestamp: item.pubDate ? new Date(item.pubDate).getTime() : Date.now(),
          source: 'Google News RSS (Fallback)',
          lastSuccessTimestamp: Date.now(),
          metadata: {
            description: item.title || `Latest news for ${ticker}`,
            newsUrl: item.link || '',
            sentiment: 'neutral',
            confidenceScore: 50,
          }
        });
      }
    } catch (err) {
      // ignore
    }
  }
  return fallbackSignals.sort((a, b) => b.timestamp - a.timestamp);
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const isDemo = searchParams.get('demo') === 'true';
  const stock = searchParams.get('stock');
  const type = searchParams.get('type');

  if (isDemo) {
    let results = [...DEMO_SIGNALS];
    
    if (stock) {
      results = results.filter(s => s.stockSymbol === stock);
    }
    if (type) {
      results = results.filter(s => s.signalType === type);
    }
    
    // Sort by timestamp desc
    results.sort((a, b) => b.timestamp - a.timestamp);
    return NextResponse.json(results);
  }

  // Live Mode: Fetch from LiveStore
  try {
    let signals = liveStore.getSignals();
    
    // FALLBACK: If LiveStore is empty (user hasn't run ingest yet), fetch real RSS news
    if (signals.length === 0) {
      signals = await fetchLiveNewsFallback();
    }

    if (stock) {
      signals = signals.filter(s => s.stockSymbol === stock);
    }
    if (type) {
      signals = signals.filter(s => s.signalType === type);
    }

    // Sort by timestamp desc for the UI
    signals.sort((a, b) => b.timestamp - a.timestamp);
    return NextResponse.json(signals);
  } catch (error) {
    console.error('Error fetching live signals:', error);
    return NextResponse.json({ error: 'Failed to fetch signals' }, { status: 500 });
  }
}
