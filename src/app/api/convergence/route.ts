import { NextResponse, NextRequest } from 'next/server';
import { runConvergenceEngine } from '@/lib/engine-runner';

export async function POST(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const isDemo = searchParams.get('demo') === 'true';

  // Run engine natively
  const convergences = await runConvergenceEngine(isDemo);

  return NextResponse.json({
    message: 'Convergence engine run completed',
    alertsCreated: convergences.length,
    alerts: convergences
  });
}
