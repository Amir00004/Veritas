"use client";

import { cn } from "@/lib/utils";

interface SiriOrbProps {
  size?: number;        // px number, default 192
  className?: string;
  colors?: {
    c1?: string;
    c2?: string;
    c3?: string;
  };
  animationDuration?: number; // seconds, default 20
}

export const SiriOrb: React.FC<SiriOrbProps> = ({
  size = 192,
  className,
  colors,
  animationDuration = 20,
}) => {
  const c1 = colors?.c1 ?? "oklch(68% 0.20 35)";   // vivid orange
  const c2 = colors?.c2 ?? "oklch(52% 0.08 40)";   // muted amber-brown
  const c3 = colors?.c3 ?? "oklch(38% 0.02 0)";    // dark grey

  const blur    = Math.max(size * 0.08, 8);
  const contrast = Math.max(size * 0.003, 1.8);

  return (
    <div
      className={cn("siri-orb", className)}
      style={{
        width:  size,
        height: size,
        "--siri-c1":       c1,
        "--siri-c2":       c2,
        "--siri-c3":       c3,
        "--siri-duration": `${animationDuration}s`,
        "--siri-blur":     `${blur}px`,
        "--siri-contrast": contrast,
      } as React.CSSProperties}
    />
  );
};
