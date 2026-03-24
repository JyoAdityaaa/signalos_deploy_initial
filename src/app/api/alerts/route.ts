import { NextResponse, NextRequest } from 'next/server';
import { DEMO_ALERTS } from '@/lib/demo-data';

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
    // For this hackathon, we simulate an empty DB if not configured
    return NextResponse.json([]);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch alerts' }, { status: 500 });
  }
}
