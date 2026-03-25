import { NextResponse, NextRequest } from 'next/server';
export const dynamic = 'force-dynamic';
import { DEMO_ALERTS } from '@/lib/demo-data';
import { liveStore } from '@/lib/live-store';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const isDemo = searchParams.get('demo') === 'true';

  if (isDemo) {
    // Return pre-computed alerts descending by timestamp
    const sorted = [...DEMO_ALERTS].sort((a, b) => b.createdAt - a.createdAt);
    return NextResponse.json(sorted);
  }

  // Live Mode: query Firestore for alerts
  try {
    const alerts = liveStore.getAlerts();
    return NextResponse.json(alerts);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch alerts' }, { status: 500 });
  }
}
