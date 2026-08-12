"use client";

import React from "react";

interface GlassButtonProps {
  children: React.ReactNode;
  variant?: "solid" | "outline" | "ghost";
  accent?: "lime" | "cyan" | "white";
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
}

export default function GlassButton({
  children,
  variant = "solid",
  accent = "lime",
  size = "md",
  className = "",
  onClick,
}: GlassButtonProps) {
  const sizeClasses = {
    sm: "px-4 py-2 text-xs",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base",
  };

  const accentColors = {
    lime: { bg: "bg-neon-lime", text: "text-gs-bg", border: "border-neon-lime", hover: "hover:shadow-[0_0_20px_rgba(212,255,0,0.3)]" },
    cyan: { bg: "bg-neon-cyan", text: "text-gs-bg", border: "border-neon-cyan", hover: "hover:shadow-[0_0_20px_rgba(0,240,255,0.3)]" },
    white: { bg: "bg-white", text: "text-gs-bg", border: "border-white", hover: "hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]" },
  };

  const a = accentColors[accent];

  const variants = {
    solid: `${a.bg} ${a.text} ${a.hover} hover:scale-[1.02]`,
    outline: `bg-transparent text-gs-text border ${a.border}/30 hover:border-${accent === "lime" ? "neon-lime" : accent === "cyan" ? "neon-cyan" : "white"} hover:bg-white/5`,
    ghost: `bg-transparent text-gs-text hover:bg-white/5`,
  };

  return (
    <button
      onClick={onClick}
      className={`
        ${sizeClasses[size]}
        ${variants[variant]}
        font-[family-name:var(--font-body)]
        font-bold uppercase tracking-[0.1em]
        rounded-none
        transition-all duration-[var(--gs-transition)]
        cursor-pointer
        ${className}
      `}
    >
      {children}
    </button>
  );
}
