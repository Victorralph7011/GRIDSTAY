"use client";

import React from "react";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: "lime" | "cyan" | "none";
  padding?: string;
  rounded?: string;
}

/**
 * GlassCard — Core glassmorphic primitive.
 *
 * Implements:
 *   backdrop-filter: blur(12px)
 *   background: rgba(255, 255, 255, 0.05)
 *   border: 1px solid rgba(255, 255, 255, 0.10)
 */
export default function GlassCard({
  children,
  className = "",
  hover = true,
  glow = "none",
  padding = "p-8",
  rounded = "rounded-2xl",
}: GlassCardProps) {
  const glowMap = {
    lime: "hover:shadow-[0_0_30px_rgba(212,255,0,0.15)]",
    cyan: "hover:shadow-[0_0_30px_rgba(0,240,255,0.15)]",
    none: "",
  };

  return (
    <div
      className={`
        glass
        ${rounded}
        ${padding}
        transition-all duration-700
        ${hover ? "hover:bg-white/[0.08] hover:border-white/20 hover:scale-[1.01]" : ""}
        ${glowMap[glow]}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
