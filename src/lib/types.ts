// ──────────────────────────────────────────
// SignalOS — Core Type Definitions
// ──────────────────────────────────────────

export type SignalType = 'bulk_deal' | 'insider_trading' | 'technical_breakout' | 'news_sentiment';

export interface Signal {
  id: string;
  stock: string;
  stockSymbol: string;
  signalType: SignalType;
  date: string;          // ISO date string
  timestamp: number;     // Unix timestamp (ms)
  metadata: SignalMetadata;
  source: string;
  lastSuccessTimestamp: number;
}

export interface SignalMetadata {
  description: string;
  value?: number;
  volume?: number;
  priceAtSignal?: number;
  sentiment?: 'positive' | 'negative' | 'neutral';
  dealSize?: string;
  buyerSeller?: string;
  insiderName?: string;
  insiderDesignation?: string;
  transactionType?: 'buy' | 'sell';
  maValue?: number;
  volumeMultiple?: number;
  newsHeadline?: string;
  newsSource?: string;
}

export interface ConvergenceAlert {
  id: string;
  stock: string;
  stockSymbol: string;
  signals: Signal[];
  signalTypes: SignalType[];
  timestamps: number[];
  windowStart: string;
  windowEnd: string;
  confidenceScore: number;
  aiSummary: string;
  createdAt: number;
  status: 'active' | 'expired' | 'acknowledged';
}

export interface StockInfo {
  name: string;
  symbol: string;
  sector: string;
  currentPrice: number;
  priceChange: number;
  priceChangePercent: number;
  signalCount: number;
  signals: Signal[];
  hasConvergence: boolean;
}

export const SIGNAL_CONFIG: Record<SignalType, {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: string;
  description: string;
}> = {
  bulk_deal: {
    label: 'Bulk Deal',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    icon: '📦',
    description: 'NSE Bulk Deal detected',
  },
  insider_trading: {
    label: 'Insider',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    icon: '👤',
    description: 'SEBI/BSE insider trading disclosure',
  },
  technical_breakout: {
    label: 'Breakout',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    icon: '📈',
    description: '200-day MA + volume spike',
  },
  news_sentiment: {
    label: 'Sentiment',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    icon: '📰',
    description: 'AI-classified news sentiment',
  },
};
