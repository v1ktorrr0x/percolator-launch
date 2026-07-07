"use client";

import { useRef, useEffect, useState } from "react";

interface AnimatedNumberProps {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
  className?: string;
}

export function AnimatedNumber({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  duration = 1.2,
  className = "",
}: AnimatedNumberProps) {
  const spanRef = useRef<HTMLSpanElement>(null);
  const numRef = useRef({ val: 0 });
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    setPrefersReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    if (!spanRef.current) return;
    if (prefersReduced) {
      spanRef.current.textContent = `${prefix}${value.toFixed(decimals)}${suffix}`;
      return;
    }

    let startTimestamp: number | null = null;
    const startVal = numRef.current.val;
    const endVal = value;
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;
      const progress = Math.min(elapsed / (duration * 1000), 1);
      
      const easeProgress = progress * (2 - progress);
      const currentVal = startVal + (endVal - startVal) * easeProgress;
      numRef.current.val = currentVal;

      if (spanRef.current) {
        const formatted = decimals > 0 ? currentVal.toFixed(decimals) : Math.round(currentVal).toLocaleString();
        spanRef.current.textContent = `${prefix}${formatted}${suffix}`;
      }

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      }
    };

    animationFrameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrameId);
  }, [value, prefix, suffix, decimals, duration, prefersReduced]);

  return (
    <span ref={spanRef} className={`font-[var(--font-jetbrains-mono)] tabular-nums ${className}`} style={{ willChange: 'contents' }}>
      {prefix}0{suffix}
    </span>
  );
}
