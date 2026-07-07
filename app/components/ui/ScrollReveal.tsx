"use client";

import React, { type ReactNode, useRef, useEffect, useState } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

interface ScrollRevealProps {
  children: ReactNode;
  direction?: "up" | "down" | "left" | "right";
  delay?: number;
  duration?: number;
  distance?: number;
  stagger?: number;
  once?: boolean;
  scale?: number;
  className?: string;
}

function getOffset(direction: string, distance: number) {
  switch (direction) {
    case "up": return { y: distance, x: 0 };
    case "down": return { y: -distance, x: 0 };
    case "left": return { y: 0, x: distance };
    case "right": return { y: 0, x: -distance };
    default: return { y: distance, x: 0 };
  }
}

export function ScrollReveal({
  children,
  direction = "up",
  delay = 0,
  duration = 0.7,
  distance = 20,
  stagger = 0,
  once = true,
  scale,
  className = "",
}: ScrollRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const prefersReduced = usePrefersReducedMotion();

  useEffect(() => {
    const el = containerRef.current;
    if (!el || prefersReduced) return;

    const safetyTimer = setTimeout(() => {
      setIsVisible(true);
    }, 600);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setIsVisible(true);
            clearTimeout(safetyTimer);
            if (once) observer.disconnect();
          }
        }
      },
      { threshold: 0.01, rootMargin: "0px 0px 50px 0px" }
    );

    observer.observe(el);
    return () => {
      clearTimeout(safetyTimer);
      observer.disconnect();
    };
  }, [once, prefersReduced]);

  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }

  const offset = getOffset(direction, distance);
  const transformStart = `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${scale ?? 1})`;

  if (stagger > 0) {
    const childrenArray = React.Children.toArray(children);
    return (
      <div ref={containerRef} className={className}>
        {childrenArray.map((child, index) => (
          <div
            key={index}
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "translate3d(0,0,0) scale(1)" : transformStart,
              transitionProperty: "opacity, transform",
              transitionDuration: `${duration * 1000}ms`,
              transitionDelay: `${delay * 1000 + index * stagger * 1000}ms`,
              transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
              willChange: "transform, opacity",
            }}
          >
            {child}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translate3d(0,0,0) scale(1)" : transformStart,
        transitionProperty: "opacity, transform",
        transitionDuration: `${duration * 1000}ms`,
        transitionDelay: `${delay * 1000}ms`,
        transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
        willChange: "transform, opacity",
      }}
    >
      {children}
    </div>
  );
}
