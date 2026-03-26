import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/components/AppContext";
import { Navbar } from "@/components/Navbar";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ModeBackground } from "@/components/ModeBackground";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SignalOS — Convergence-Based Stock Intelligence",
  description: "Identify high-probability stock alerts when multiple independent signals converge.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-slate-950 text-slate-50 selection:bg-indigo-500/30 overflow-x-hidden`}>
        <AppProvider>
          {/* Dynamic Background based on Live/Demo mode */}
          <ModeBackground />
          <TooltipProvider>
            <div className="relative z-10 flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-1 pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
                {children}
              </main>
              <DisclaimerBanner />
            </div>
          </TooltipProvider>
        </AppProvider>
      </body>
    </html>
  );
}
