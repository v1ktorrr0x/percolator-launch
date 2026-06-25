"use client";

import dynamic from "next/dynamic";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { MobileBottomNav } from "./MobileBottomNav";
import { ChromeGate } from "./ChromeGate";
import { TickerBanner } from "./TickerBanner";
import { MainnetBetaBanner } from "./MainnetBetaBanner";

const Aurora = dynamic(
  () => import("@/components/ui/Aurora"),
  { ssr: false }
);

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-[#0A0A0F] text-white select-none">
      {/* Global Aurora WebGL backdrop */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-80">
        <Aurora
          colorStops={["#9945FF", "#14F195", "#5227FF"]}
          blend={0.91}
          amplitude={1.2}
          speed={0.5}
        />
      </div>
      {/* Dark vignette contrast overlay */}
      <div className="fixed inset-0 bg-black/35 z-[1] pointer-events-none" />

      <div className="relative z-10 flex min-h-screen flex-col">
        <ChromeGate>
          <TickerBanner />
          <MainnetBetaBanner />
        </ChromeGate>
        <Header />
        <main className="flex-1 pb-[60px] md:pb-0">{children}</main>
        <Footer />
        <MobileBottomNav />
      </div>
    </div>
  );
}
