import { ShieldAlert } from 'lucide-react';

export function DisclaimerBanner() {
  return (
    <div className="fixed bottom-0 w-full bg-amber-500/10 border-t border-amber-500/20 backdrop-blur-md z-50 py-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center gap-2 text-xs font-semibold text-amber-500/80 tracking-wide">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>THIS IS A PROOF OF CONCEPT. NOT SEBI-REGISTERED INVESTMENT ADVICE. DO NOT TRADE ON THESE SIGNALS.</span>
        </div>
      </div>
    </div>
  );
}
