import { NextResponse, NextRequest } from 'next/server';
import { DEMO_SIGNALS } from '@/lib/demo-data';
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
    // const signalsCol = collection(db, 'signals');
    // const signalSnapshot = await getDocs(signalsCol);
    // const signalList = signalSnapshot.docs.map(doc => doc.data());
    // return NextResponse.json(signalList);
    
    // For this hackathon, live mode returns empty array if no Firebase connected
    return NextResponse.json([]);
  } catch (error) {
    console.error('Error fetching live signals:', error);
    return NextResponse.json({ error: 'Failed to fetch signals' }, { status: 500 });
  }
}
