import { NextResponse, NextRequest } from 'next/server';
import { findConvergences } from '@/lib/convergence-engine';
import { generateAISummary } from '@/lib/ai-summary';
import { DEMO_SIGNALS } from '@/lib/demo-data';

export async function POST(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const isDemo = searchParams.get('demo') === 'true';

  let signalsToProcess = [];

  if (isDemo) {
    signalsToProcess = DEMO_SIGNALS;
  } else {
    // In live mode, fetch from Firestore here
    // return NextResponse.json({ message: 'Live mode active: fetching from Firestore' });
    signalsToProcess = [];
  }

  // Run engine
  const convergences = findConvergences(signalsToProcess, { filterStale: !isDemo });

  // Generate AI Summaries (for demo, these are pre-computed, but let's simulate adding them if missing)
  for (const conv of convergences) {
    if (!conv.aiSummary) {
      conv.aiSummary = await generateAISummary(conv);
    }
  }

  // In live mode, save `convergences` to Firestore 'alerts' collection here

  return NextResponse.json({
    message: 'Convergence engine run completed',
    alertsCreated: convergences.length,
    alerts: convergences
  });
}
