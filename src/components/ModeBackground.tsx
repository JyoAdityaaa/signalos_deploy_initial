"use client";

import { useAppContext } from './AppContext';

/**
 * Dynamic background layer that shifts based on Live/Demo mode.
 * Live: Deep navy-black with indigo accents
 * Demo: Subtle dark amber tint
 */
export function ModeBackground() {
  const { isDemoMode } = useAppContext();

  return (
    <div className="fixed inset-0 z-0 pointer-events-none transition-colors duration-700">
      {isDemoMode ? (
        <>
          {/* Demo Mode: warm amber tinted background */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-950/20 via-slate-950 to-slate-950" />
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-900/15 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-950/20 blur-[120px] rounded-full" />
        </>
      ) : (
        <>
          {/* Live Mode: deep navy-black with cool indigo */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-950 to-indigo-950/30" />
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-900/20 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-slate-800/30 blur-[120px] rounded-full" />
        </>
      )}
    </div>
  );
}
