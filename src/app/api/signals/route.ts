import { NextResponse, NextRequest } from 'next/server';
export const dynamic = 'force-dynamic';
import { DEMO_SIGNALS } from '@/lib/demo-data';
import { liveStore } from '@/lib/live-store';
// import { collection, getDocs } from 'firebase/firestore';
// import { db } from '@/lib/firebase';

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

  // Live Mode: In a real app, query Firestore here
  try {
    const signals = liveStore.getSignals();
    return NextResponse.json(signals);
  } catch (error) {
    console.error('Error fetching live signals:', error);
    return NextResponse.json({ error: 'Failed to fetch signals' }, { status: 500 });
  }
}
