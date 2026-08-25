"use client";

import React from "react";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: string;
  rounded?: string;
}

/**
 * GlassCard — Core glassmorphic primitive, matching .glass-card in globals.css.
 *
 * Implements:
 *   backdrop-filter: blur(20px)
 *   background: rgba(255, 255, 255, 0.05)
 *   border: 1px solid rgba(255, 255, 255, 0.20)
 */
export default function GlassCard({
  children,
  className = "",
  hover = true,
  padding = "p-8",
  rounded = "rounded-2xl",
}: GlassCardProps) {
  return (
    <div
      className={`
        ${rounded}
        ${padding}
        border border-white/20
        backdrop-blur-[20px]
        transition-all duration-700
        ${hover ? "hover:bg-white/[0.08] hover:border-white/30 hover:scale-[1.01]" : ""}
        ${className}
      `}
      style={{ background: "rgba(255, 255, 255, 0.05)" }}
    >
      {children}
    </div>
  );
}
