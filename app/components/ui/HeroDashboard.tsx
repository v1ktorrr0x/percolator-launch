"use client";

import { useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";

/**
 * Hero visual — a floating dashboard panel with a crisp gradient area
 * chart and a soft reflection, tilted in 3D. Brand-tinted (purple → cyan).
 * Animation is JS-driven via motion (not CSS keyframes) so the draw-in,
 * fill, and ping reliably play on every mount. Crisp on purpose — no blur
 * filters; the tilt + reflection carry the centerpiece feel.
 */

const EASE = [0.22, 1, 0.36, 1] as const;

/* One clock for the whole entrance. The panel itself starts entering at
   0.5s (page.tsx) and is visibly in by ~0.7s — the draw starts exactly
   then, so the line always eases in the moment the pane arrives. */
const DRAW_AT = 0.7;
const DRAW_DUR = 1.6;
const DOT_AT = DRAW_AT + DRAW_DUR; // dot pops the instant the line finishes

const LINE =
  "M20,250 C60,245 96,218 138,230 C168,239 196,272 240,258 C300,242 338,180 416,152 C470,132 506,150 544,140";
const AREA = `${LINE} L544,302 L20,302 Z`;

function Screen() {
  return (
    <svg viewBox="0 0 560 360" className="hero-dash-svg" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="hd-hue" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#9945FF" />
          <stop offset="50%" stopColor="#C44DFF" />
          <stop offset="100%" stopColor="#14F195" />
        </linearGradient>
        <linearGradient id="hd-vfade" x1="0" y1="302" x2="0" y2="120" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fff" stopOpacity="1" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="hd-topedge" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#fff" stopOpacity="0" />
          <stop offset="50%" stopColor="#fff" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <mask id="hd-mask">
          <path d={AREA} fill="url(#hd-vfade)" />
        </mask>
        {/* reveals the area left→right in lockstep with the line draw */}
        <clipPath id="hd-reveal">
          <motion.rect
            x="20"
            y="0"
            height="360"
            initial={{ width: 0 }}
            animate={{ width: 524 }}
            transition={{ duration: DRAW_DUR, delay: DRAW_AT, ease: EASE }}
          />
        </clipPath>
      </defs>

      {/* panel */}
      <rect x="1" y="1" width="558" height="358" rx="16" fill="rgba(255,255,255,0.018)" stroke="rgba(255,255,255,0.09)" strokeWidth="1" />
      <line x1="48" y1="2.5" x2="512" y2="2.5" stroke="url(#hd-topedge)" strokeWidth="1.5" />

      {/* faint UI */}
      <g opacity="0.5">
        <rect x="30" y="34" width="74" height="5" rx="2.5" fill="#fff" opacity="0.16" />
        <rect x="30" y="48" width="120" height="4" rx="2" fill="#fff" opacity="0.10" />
        <rect x="30" y="60" width="96" height="4" rx="2" fill="#fff" opacity="0.10" />
        <rect x="30" y="72" width="110" height="4" rx="2" fill="#fff" opacity="0.08" />
        <rect x="250" y="44" width="40" height="13" rx="3" fill="#fff" opacity="0.12" />
        <rect x="300" y="44" width="40" height="13" rx="3" fill="#fff" opacity="0.12" />
        <rect x="396" y="40" width="134" height="4" rx="2" fill="#fff" opacity="0.09" />
        <rect x="396" y="52" width="100" height="4" rx="2" fill="#fff" opacity="0.07" />
        <rect x="500" y="42" width="20" height="9" rx="2" fill="#14F195" opacity="0.5" />
      </g>

      {/* area fill — revealed left→right with the line via hd-reveal */}
      <path d={AREA} fill="url(#hd-hue)" mask="url(#hd-mask)" opacity="0.55" clipPath="url(#hd-reveal)" />

      {/* line — single crisp gradient stroke, draws in left→right */}
      <motion.path
        d={LINE}
        fill="none"
        stroke="url(#hd-hue)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: DRAW_DUR, delay: DRAW_AT, ease: EASE }}
      />

      {/* endpoint — dot pops in after the draw, ring pings forever */}
      <motion.circle
        cx="544"
        cy="140"
        r="3.5"
        fill="none"
        stroke="#14F195"
        strokeWidth="1.5"
        style={{ transformBox: "fill-box", transformOrigin: "center" }}
        initial={{ opacity: 0, scale: 1 }}
        animate={{ opacity: [0.8, 0], scale: [1, 3.2] }}
        transition={{ duration: 2.4, delay: DOT_AT + 0.3, repeat: Infinity, ease: "easeOut" }}
      />
      <motion.circle
        cx="544"
        cy="140"
        r="3.5"
        fill="#fff"
        style={{ transformBox: "fill-box", transformOrigin: "center" }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: DOT_AT, ease: "easeOut" }}
      />
    </svg>
  );
}

export function HeroDashboard() {
  // Cursor parallax — pointer position (normalized -0.5..0.5) drives the 3D
  // tilt through springs, so the panel leans a few degrees toward the cursor
  // and settles with weight when the pointer stops.
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 100, damping: 20 });
  const sy = useSpring(py, { stiffness: 100, damping: 20 });
  const rotateY = useTransform(sx, [-0.5, 0.5], [-13, -7]);
  const rotateX = useTransform(sy, [-0.5, 0.5], [5, 0]);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      px.set(e.clientX / window.innerWidth - 0.5);
      py.set(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [px, py]);

  return (
    <div className="hero-dash" aria-hidden="true">
      {/* float is JS-driven (y only) on the outer wrapper; the tilt +
          parallax own the inner element's transform — no property fights */}
      <motion.div
        className="w-full"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      >
        <motion.div
          className="hero-dash-3d"
          style={{ rotateY, rotateX, scale: 0.94, transformPerspective: 1200 }}
        >
          <div className="hero-dash-screen">
            <Screen />
          </div>
          <div className="hero-dash-reflection">
            <Screen />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
