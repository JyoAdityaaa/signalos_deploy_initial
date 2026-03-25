import { NextResponse, NextRequest } from 'next/server';
export const dynamic = 'force-dynamic';
import { liveStore } from '@/lib/live-store';
import { DEMO_ALERTS } from '@/lib/demo-data';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const isDemo = searchParams.get('demo') === 'true';

  if (isDemo) {
    // Return insights from DEMO_ALERTS
    const insights: Record<string, string> = {};
    DEMO_ALERTS.forEach(alert => {
      insights[alert.stockSymbol] = alert.aiSummary;
    });
    return NextResponse.json(insights);
  }

  // Live Mode: fetch from LiveStore
  const insights = liveStore.getStockInsights();
  return NextResponse.json(insights);
}
