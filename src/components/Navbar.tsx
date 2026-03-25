"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { DemoToggle } from './DemoToggle';
import { Activity, Zap, Radio } from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'Overview', icon: Activity },
    { href: '/alerts', label: 'Convergences', icon: Zap },
    { href: '/feed', label: 'Live Feed', icon: Radio },
  ];

  return (
    <nav className="fixed top-0 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 group-hover:bg-indigo-500/30 transition-colors">
                <Zap className="w-5 h-5" />
              </div>
              <span className="font-bold text-xl tracking-tight text-white">SignalOS</span>
            </Link>

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
                        ? 'text-white border-b-2 border-indigo-500 py-5 -mb-[2px]' 
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
