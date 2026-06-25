"use client";

import React from 'react';
import ScrollStack, { ScrollStackItem } from './ScrollStack';

// ── Custom Premium Mockup / SVG Animations ──

const PermissionlessChatDemo: React.FC = () => (
  <div className="relative flex h-full w-full flex-col justify-center items-center overflow-hidden p-2 min-h-[180px]">
    <div className="flex flex-col space-y-3.5 w-full max-w-[340px]">
      <div className="self-end rounded-2xl rounded-tr-sm bg-neutral-800/80 px-3.5 py-1.5 text-[12px] md:text-[13px] text-neutral-100 shadow-sm border border-neutral-700/50">
        Can I deploy a perp market for my token?
      </div>
      <div className="self-start rounded-2xl rounded-tl-sm bg-[#0C0C0C]/80 px-3.5 py-1.5 text-[12px] md:text-[13px] text-neutral-100 shadow-sm ring-1 ring-neutral-800">
        <div className="flex items-center space-x-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#14F195]">
            <path d="M12 8V4H8" />
            <rect width="16" height="12" x="4" y="8" rx="2" />
            <path d="M2 14h2" />
            <path d="M20 14h2" />
            <path d="M15 13v2" />
            <path d="M9 13v2" />
          </svg>
          <div className="overflow-hidden whitespace-nowrap text-white/90">
            Yes! Just paste the token address. No whitelists.
          </div>
          <div className="h-2.5 w-1 bg-[#14F195] rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  </div>
);

const DeployTerminalDemo: React.FC = () => (
  <div className="w-full max-w-[340px] rounded-xl bg-[#08080C] shadow-2xl border border-neutral-800/80 overflow-hidden flex flex-col select-none my-2">
    <div className="flex items-center px-3 py-1.5 border-b border-neutral-900 bg-[#040406]">
      <div className="flex space-x-1.5">
        <div className="w-1.5 h-1.5 rounded-full bg-neutral-800" />
        <div className="w-1.5 h-1.5 rounded-full bg-neutral-700" />
        <div className="w-1.5 h-1.5 rounded-full bg-neutral-600" />
      </div>
      <div className="mx-auto text-[10px] text-neutral-600 font-medium font-sans -ml-3">percolator-cli</div>
    </div>
    <div className="p-4 font-mono text-[10px] md:text-[11px] text-neutral-400 space-y-1.5 text-left">
      <p className="text-neutral-400">
        user@solana:~$ <span className="text-white">percolator create --token SOL</span>
      </p>
      <div className="flex items-center space-x-1.5 text-neutral-500">
        <span className="inline-block animate-spin text-[10px] text-[#9945FF]">⠋</span>
        <span>deploying market program...</span>
      </div>
      <p className="text-neutral-500">
        initializing slab... <span className="text-[#14F195]">done</span>
      </p>
      <p className="text-[#14F195] flex items-center gap-1">
        <span>✔ market live on Solana</span>
        <span className="inline-block w-1.5 h-3 bg-[#14F195] align-middle animate-pulse" />
      </p>
    </div>
  </div>
);

const SolanaLogoAnimation: React.FC = () => (
  <div className="relative flex items-center justify-center w-full h-full min-h-[180px] select-none">
    <div className="absolute w-24 h-24 rounded-full bg-[#14F195]/10 blur-3xl animate-pulse" />

    <svg width="160" height="130" viewBox="0 0 24 24" fill="none" className="overflow-visible solana-svg max-w-[160px]" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="solana-logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#9945FF" />
          <stop offset="50%" stopColor="#8052FF" />
          <stop offset="100%" stopColor="#14F195" />
        </linearGradient>
        <filter id="solana-logo-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="0.8" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      <style>{`
        @keyframes floatSolana {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-1.5px) rotate(0.5deg); }
        }
        .solana-svg {
          animation: floatSolana 4s ease-in-out infinite;
        }
      `}</style>

      <g filter="url(#solana-logo-glow)">
        <path
          d="m23.8764 18.0313-3.962 4.1393a.9201.9201 0 0 1-.306.2106.9407.9407 0 0 1-.367.0742H.4599a.4689.4689 0 0 1-.2522-.0733.4513.4513 0 0 1-.1696-.1962.4375.4375 0 0 1-.0314-.2545.4438.4438 0 0 1 .117-.2298l3.9649-4.1393a.92.92 0 0 1 .3052-.2102.9407.9407 0 0 1 .3658-.0746H23.54a.4692.4692 0 0 1 .2523.0734.4531.4531 0 0 1 .1697.196.438.438 0 0 1 .0313.2547.4442.4442 0 0 1-.1169.2297zm-3.962-8.3355a.9202.9202 0 0 0-.306-.2106.941.941 0 0 0-.367-.0742H.4599a.4687.4687 0 0 0-.2522.0734.4513.4513 0 0 0-.1696.1961.4376.4376 0 0 0-.0314.2546.444.444 0 0 0 .117.2297l3.9649 4.1394a.9204.9204 0 0 0 .3052.2102c.1154.049.24.0744.3658.0746H23.54a.469.469 0 0 0 .2523-.0734.453.453 0 0 0 .1697-.1961.4382.4382 0 0 0 .0313-.2546.4444.4444 0 0 0-.1169-.2297zM.46 6.7225h18.7815a.9411.9411 0 0 0 .367-.0742.9202.9202 0 0 0 .306-.2106l3.962-4.1394a.4442.4442 0 0 0 .117-.2297.4378.4378 0 0 0-.0314-.2546.453.453 0 0 0-.1697-.196.469.469 0 0 0-.2523-.0734H4.7596a.941.941 0 0 0-.3658.0745.9203.9203 0 0 0-.3052.2102L.1246 5.9687a.4438.4438 0 0 0-.1169.2295.4375.4375 0 0 0 .0312.2544.4512.4512 0 0 0 .1692.196.4689.4689 0 0 0 .2518.0739z"
          fill="url(#solana-logo-grad)"
        />
      </g>
    </svg>
  </div>
);

const InsuranceFundDemo: React.FC = () => (
  <div className="relative flex h-full min-h-[180px] flex-col items-center justify-center p-2 w-full">
    <div className="relative w-full max-w-[285px] h-[135px] flex items-center justify-center">
      {/* Card 1 (Bottom back) */}
      <div className="absolute left-0 right-0 bottom-1 rounded-xl bg-neutral-900/40 p-2.5 border border-neutral-800/40 shadow-md scale-90 translate-y-5 opacity-30 z-0">
        <div className="flex items-center space-x-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-800 text-[#14F195]/60">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
            </svg>
          </div>
          <div className="flex-1 space-y-1.5">
            <div className="h-2 w-3/4 rounded bg-neutral-800" />
            <div className="h-1.5 w-1/2 rounded bg-neutral-800/60" />
          </div>
        </div>
      </div>

      {/* Card 2 (Middle) */}
      <div className="absolute left-0 right-0 bottom-3 rounded-xl bg-[#0A0A0F]/80 p-3 border border-neutral-800 shadow-lg scale-95 translate-y-2.5 opacity-60 z-10">
        <div className="flex items-center space-x-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-800 text-[#9945FF]/80">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <div className="flex-1 space-y-1.5">
            <div className="h-2 w-2/3 rounded bg-neutral-700" />
            <div className="h-1.5 w-1/3 rounded bg-neutral-800/60" />
          </div>
        </div>
      </div>

      {/* Card 3 (Front active) */}
      <div className="relative w-full rounded-xl bg-[#0F0F15] p-4 border border-neutral-800 shadow-xl z-20 transition-transform hover:scale-[1.02] duration-300">
        <div className="flex items-center space-x-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#14F195]/10 text-[#14F195] ring-2 ring-[#14F195]/20">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[12px] font-bold text-white tracking-wide truncate">Fee Absorbed +$4.20</div>
            <div className="text-[10px] text-[#14F195] font-mono font-semibold">Active Fund Balance: $63.2K</div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const ImmutableKeyAnimation: React.FC = () => (
  <svg width="220" height="180" viewBox="0 0 160 120" fill="none" className="overflow-visible">
    <defs>
      <linearGradient id="key-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#9945FF" />
        <stop offset="100%" stopColor="#FF3B5C" />
      </linearGradient>
    </defs>
    <style>{`
      @keyframes floatKey {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        50% { transform: translateY(-4px) rotate(3deg); }
      }
      @keyframes burnSpark {
        0% { transform: translate(0, 0) scale(1); opacity: 0; }
        30% { opacity: 0.8; }
        100% { transform: translate(var(--dx), var(--dy)) scale(0.2); opacity: 0; }
      }
      @keyframes lockPulse {
        0%, 100% { transform: scale(1); opacity: 0.8; }
        50% { transform: scale(1.05); opacity: 1; }
      }
      .anim-key {
        transform-origin: 80px 45px;
        animation: floatKey 4s ease-in-out infinite;
      }
      .spark {
        animation: burnSpark 2s ease-out infinite;
      }
      .lock-bg {
        transform-origin: 80px 75px;
        animation: lockPulse 3s ease-in-out infinite;
      }
    `}</style>

    <g className="lock-bg">
      <rect x="55" y="55" width="50" height="40" rx="6" fill="rgba(153, 69, 255, 0.05)" stroke="rgba(153, 69, 255, 0.3)" strokeWidth="1.5" />
      <path d="M 68 55 L 68 40 C 68 28, 92 28, 92 40 L 92 55" fill="none" stroke="rgba(153, 69, 255, 0.3)" strokeWidth="1.5" strokeDasharray="3 3" />
      <circle cx="80" cy="72" r="4" fill="rgba(153, 69, 255, 0.5)" />
      <path d="M 80 76 L 80 84" stroke="rgba(153, 69, 255, 0.5)" strokeWidth="1.5" strokeLinecap="round" />
    </g>

    <g className="anim-key">
      <path
        d="M 50 45 C 50 37, 62 37, 62 45 C 62 53, 50 53, 50 45 M 62 45 L 105 45 L 105 55 L 100 55 L 100 45 L 90 45 L 90 55 L 85 55 L 85 45 Z"
        fill="url(#key-grad)"
        stroke="#9945FF"
        strokeWidth="1"
        style={{ filter: 'drop-shadow(0 0 6px rgba(153, 69, 255, 0.6))' }}
      />
      <circle cx="95" cy="45" r="2" fill="#FF3B5C" className="spark" style={{ '--dx': '15px', '--dy': '-15px' } as React.CSSProperties} />
      <circle cx="102" cy="48" r="1.5" fill="#9945FF" className="spark" style={{ '--dx': '20px', '--dy': '-5px' } as React.CSSProperties} />
      <circle cx="88" cy="43" r="2" fill="#fff" className="spark" style={{ '--dx': '10px', '--dy': '-20px' } as React.CSSProperties} />
    </g>
  </svg>
);

const LiquidationGuardDemo: React.FC = () => (
  <div className="relative flex h-full min-h-[180px] w-full items-end justify-center overflow-hidden p-2">
    <div className="absolute inset-0 grid grid-cols-6 grid-rows-4 opacity-5">
      {Array.from({ length: 24 }).map((_, i) => (
        <div key={i} className="border-b border-r border-white" />
      ))}
    </div>

    <svg className="absolute bottom-0 h-[80%] w-full" viewBox="0 0 200 100" preserveAspectRatio="none">
      <defs>
        <linearGradient id="area-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#14F195" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#14F195" stopOpacity="0" />
        </linearGradient>
      </defs>

      <style>{`
        @keyframes priceFlow {
          to { stroke-dashoffset: -40; }
        }
        .price-path {
          stroke-dasharray: 8 4;
          animation: priceFlow 2s linear infinite;
        }
      `}</style>

      <path d="M 0,100 L 0,60 C 30,50 50,80 80,60 C 110,40 130,70 160,30 C 180,10 200,40 200,40 L 200,100 Z" fill="url(#area-gradient)" />

      <line x1="0" y1="75" x2="200" y2="75" stroke="#FF3B5C" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />

      <path d="M 0,60 C 30,50 50,80 80,60 C 110,40 130,70 160,30 C 180,10 200,40 200,40" fill="none" stroke="#14F195" strokeWidth="2" className="price-path" />

      <circle cx="160" cy="30" r="4" fill="#14F195" />
      <circle cx="160" cy="30" r="12" fill="rgba(20, 241, 149, 0.2)" className="animate-ping" style={{ transformOrigin: '160px 30px' }} />
    </svg>
    <div className="absolute top-2 left-4 text-[10px] font-mono text-[#FF3B5C] bg-[#FF3B5C]/10 px-1.5 py-0.5 rounded">
      Guard Active (LP Safe)
    </div>
  </div>
);

// ── Item Mapping Definitions ──

interface StackItemData {
  title: string;
  description: string;
  label: string;
  icon: React.ReactNode;
  graphic: React.ReactNode;
}

const stackItems: StackItemData[] = [
  {
    title: "No Permission Needed",
    description: "No governance, no whitelists, no waiting. Deploy your own perpetual market in 60 seconds.",
    label: "Permissionless",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5a17.92 17.92 0 0 1-8.716-2.247m0 0A9 9 0 0 1 3 12c0-1.47.353-2.856.978-4.082" />
      </svg>
    ),
    graphic: <PermissionlessChatDemo />
  },
  {
    title: "Deploy Instantly",
    description: "Run commands to create markets on-chain with minimal friction.",
    label: "Console",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="18" x="3" y="3" rx="2" />
        <path d="m9 10 3 2-3 2" />
        <path d="m14 14.5 3 0" />
      </svg>
    ),
    graphic: <DeployTerminalDemo />
  },
  {
    title: "Insurance Fund",
    description: "Every trade adds to it. Your market stays solvent even when traders get liquidated.",
    label: "Active",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
      </svg>
    ),
    graphic: <InsuranceFundDemo />
  },
  {
    title: "Fully On-Chain",
    description: "Every trade, liquidation, and funding payment settled on Solana. Nothing custodial, ever.",
    label: "Verified",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    graphic: <SolanaLogoAnimation />
  },
  {
    title: "Burn the Admin Key",
    description: "One click and it’s immutable forever. Your market, your rules, permanently secure.",
    label: "Novel",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25z" />
      </svg>
    ),
    graphic: <ImmutableKeyAnimation />
  },
  {
    title: "Liquidation Guard",
    description: "Fully automated on-chain liquidations keep liquidity providers safe from bad debt accumulation.",
    label: "Secure",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
    graphic: <LiquidationGuardDemo />
  }
];

export const MagicScrollStack: React.FC = () => {
  return (
    <div className="w-full">
      <ScrollStack
        useWindowScroll={true}
        className="use-window-scroll"
        itemDistance={100}
        itemScale={0.03}
        itemStackDistance={30}
        stackPosition={270}
        scaleEndPosition={190}
        baseScale={0.92}
      >
        {stackItems.map((item, idx) => (
          <ScrollStackItem key={idx}>
            <div className="flex flex-col md:flex-row items-center md:items-stretch justify-between w-full h-full gap-6 md:gap-10">
              {/* Left Side: Info */}
              <div className="flex flex-col justify-center flex-1 text-left select-text">
                <div className="flex items-center gap-3 mb-3">
                  {item.icon && (
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-800/60 text-[#14F195] border border-white/5 shrink-0">
                      {item.icon}
                    </div>
                  )}
                  <div>
                    <span className="text-[9px] font-mono font-bold text-[#14F195]/85 tracking-wider bg-[#14F195]/5 border border-[#14F195]/15 px-2 py-0.5 rounded uppercase">
                      {item.label}
                    </span>
                  </div>
                </div>
                <h3 className="text-xl md:text-2xl lg:text-3xl font-bold tracking-tight text-white uppercase mb-3 font-jakarta">
                  {item.title}
                </h3>
                <p className="text-xs md:text-sm text-neutral-400 leading-relaxed max-w-md font-inter">
                  {item.description}
                </p>
              </div>

              {/* Right Side: Graphic Slot */}
              <div className="flex items-center justify-center flex-1 w-full max-w-[280px] md:max-w-none min-h-[140px] md:min-h-0 select-none">
                {item.graphic}
              </div>
            </div>
          </ScrollStackItem>
        ))}
      </ScrollStack>
    </div>
  );
};

export default MagicScrollStack;
