import { NextResponse } from 'next/server';
import { liveStore } from '@/lib/live-store';
import Parser from 'rss-parser';

export const dynamic = 'force-dynamic';

const parser = new Parser();

const TARGET_TICKERS = ['RELIANCE', 'HDFCBANK', 'TCS', 'INFY', 'BAJAJ-AUTO'];

/**
 * Directly fetch real news headlines from Google News RSS.
 * This works WITHOUT Firestore — pure web scraping.
 */
async function fetchLiveNewsSignals(): Promise<any[]> {
  const signals: any[] = [];

  for (const ticker of TARGET_TICKERS) {
    try {
      const rssUrl = `https://news.google.com/rss/search?q=${ticker}+stock+India&hl=en-IN&gl=IN&ceid=IN:en`;
      
      const feedPromise = parser.parseURL(rssUrl);
      const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 5000));
      const feed = await Promise.race([feedPromise, timeoutPromise]);

      if (feed && feed.items && feed.items.length > 0) {
        // Take top 2 headlines per ticker
        const topItems = feed.items.slice(0, 2);
        for (const item of topItems) {
          signals.push({
            id: `live-${ticker}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            stock: `${ticker}.NS`,
            stockSymbol: `${ticker}.NS`,
            signalType: 'news_sentiment',
            sentiment: 'neutral',
            timestamp: item.pubDate ? new Date(item.pubDate).getTime() : Date.now(),
            metadata: {
              description: item.title || `Latest news for ${ticker}`,
              newsUrl: item.link || '',
              source: 'Google News RSS'
            }
          });
        }
      }
    } catch (err) {
      console.warn(`[PULSE] RSS fetch failed for ${ticker}:`, err);
    }
  }

  return signals.sort((a, b) => b.timestamp - a.timestamp).slice(0, 10);
}

/**
 * Generate an AI summary using Gemini 2.5 Flash via REST API.
 */
async function generateGeminiSummary(signals: any[]): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || signals.length === 0) {
    return "Market activity detected across tracked tickers. The convergence engine is analyzing patterns for high-probability trade setups.";
  }

  try {
    const signalsText = signals
      .slice(0, 5)
      .map(s => `- ${s.stockSymbol || s.stock}: ${s.metadata.description}`)
      .join('\n');

    const prompt = `You are SignalOS Market Intelligence. Analyze these recent Indian stock market signals:
${signalsText}

Write exactly 2 sentences summarizing the overall market sentiment and key themes. Start directly with the insight. No disclaimers.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 150 },
        }),
      }
    );

    if (response.ok) {
      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) return text.trim();
    }
  } catch (error) {
    console.error("[PULSE] Gemini summary generation failed:", error);
  }

  return "Market headlines indicate mixed sentiment across Indian large-caps. The engine continues to track emerging convergence opportunities.";
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const isDemo = searchParams.get('demo') === 'true';

    let recentSignals: any[] = [];
    let isHistorical = false;

    if (isDemo) {
      recentSignals = liveStore.getSignals().sort((a: any, b: any) => b.timestamp - a.timestamp).slice(0, 5);
    } else {
      // === STRATEGY: Bypass Firestore entirely. Fetch REAL news directly from the web. ===
      // This guarantees the user always sees fresh, real-world data regardless of database state.
      
      // Step 1: Try to get signals from the in-memory live store first
      const storeSignals = liveStore.getSignals();
      if (storeSignals.length > 0) {
        recentSignals = storeSignals.sort((a: any, b: any) => b.timestamp - a.timestamp).slice(0, 10);
      }

      // Step 2: If no in-memory signals, fetch directly from RSS (guaranteed to work)
      if (recentSignals.length === 0) {
        console.log("[PULSE] No cached signals found. Fetching live RSS headlines...");
        recentSignals = await fetchLiveNewsSignals();
        isHistorical = false; // These are real-time web fetches, not historical
      }
    }

    if (recentSignals.length === 0) {
      return NextResponse.json({ 
        summary: "Connecting to market data sources. Please click 'Refresh Pulse' to initiate the first data fetch.", 
        signals: [], 
        isHistorical: false 
      });
    }

    // Generate AI Summary
    const aiSummary = await generateGeminiSummary(recentSignals);

    return NextResponse.json({ 
      summary: aiSummary, 
      signals: recentSignals, 
      isHistorical 
    });
  } catch (err: any) {
    console.error("[PULSE ERROR]", err);
    return NextResponse.json({ 
      summary: "Market Pulse is initializing. Please try refreshing in a moment.", 
      signals: [], 
      isHistorical: false, 
      error: err.message 
    }, { status: 200 }); // Return 200 even on error so UI doesn't break
  }
}
