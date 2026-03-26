"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { DemoToggle } from './DemoToggle';
import { Activity, Zap, Radio } from 'lucide-react';
import { useAppContext } from './AppContext';

export function Navbar() {
  const pathname = usePathname();
  const { isDemoMode } = useAppContext();

  const links = [
    { href: '/', label: 'Overview', icon: Activity },
    { href: '/alerts', label: 'Convergences', icon: Zap },
    { href: '/feed', label: 'Live Feed', icon: Radio },
  ];

  return (
    <nav className={`fixed top-0 w-full border-b z-50 backdrop-blur-xl transition-colors duration-500 ${
      isDemoMode 
        ? 'bg-amber-950/20 border-amber-900/30' 
        : 'bg-slate-950/90 border-slate-800'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2 group">
                <div className={`flex items-center justify-center w-8 h-8 rounded-lg transition-colors ${
                  isDemoMode 
                    ? 'bg-amber-500/20 text-amber-400 group-hover:bg-amber-500/30'
                    : 'bg-indigo-500/20 text-indigo-400 group-hover:bg-indigo-500/30'
                }`}>
                  <Zap className="w-5 h-5" />
                </div>
                <span className="font-bold text-xl tracking-tight text-white">SignalOS</span>
              </Link>
              
              {/* Global Status Badge */}
              {isDemoMode ? (
                <div className="hidden sm:flex items-center gap-2 bg-amber-500/10 border border-amber-500/25 px-3 py-1 rounded-full">
                  <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                  <span className="text-[10px] font-bold tracking-wider text-amber-400">SANDBOX MODE</span>
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/25 px-3 py-1 rounded-full" 
                     style={{ boxShadow: '0 0 12px rgba(16, 185, 129, 0.15)' }}>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-[10px] font-bold tracking-wider text-emerald-400">LIVE DATA</span>
                </div>
              )}
            </div>

            <div className="hidden md:flex space-x-6">
              {links.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                      isActive 
                        ? `text-white border-b-2 py-5 -mb-[2px] ${isDemoMode ? 'border-amber-500' : 'border-indigo-500'}` 
                        : 'text-slate-400 hover:text-slate-200 py-5'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex flex-1 justify-end items-center gap-4">
            <DemoToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}
