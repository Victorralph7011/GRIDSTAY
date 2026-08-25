"use client";

import React from "react";

interface GlassButtonProps {
  children: React.ReactNode;
  variant?: "solid" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
}

export default function GlassButton({
  children,
  variant = "solid",
  size = "md",
  className = "",
  onClick,
}: GlassButtonProps) {
  const sizeClasses = {
    sm: "px-4 py-2 text-xs",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base",
  };

  const variants = {
    solid: "bg-[var(--color-gs-charcoal)] text-white hover:bg-[var(--color-gs-black)] hover:scale-[1.02]",
    outline: "bg-transparent text-[var(--color-gs-charcoal)] border border-[var(--color-gs-charcoal)]/30 hover:border-[var(--color-gs-charcoal)] hover:bg-black/5",
    ghost: "bg-transparent text-[var(--color-gs-charcoal)] hover:bg-black/5",
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
