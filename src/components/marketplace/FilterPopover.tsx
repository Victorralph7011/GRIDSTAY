"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

interface FilterPopoverProps {
  label: string;
  /** Shown in place of the label when filters are applied, e.g. "3 selected". */
  activeSummary?: string | null;
  children: React.ReactNode;
}

export default function FilterPopover({
  label,
  activeSummary,
  children,
}: FilterPopoverProps) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const isActive = Boolean(activeSummary);

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-full border text-[11px] font-bold uppercase tracking-[0.08em] transition-colors cursor-pointer whitespace-nowrap ${
          isActive
            ? "bg-gs-charcoal text-gs-white border-gs-charcoal"
            : "bg-transparent text-gs-charcoal border-gs-lightgrey hover:border-gs-midgrey"
        }`}
      >
        {activeSummary ?? label}
        <ChevronDown
          size={13}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute z-30 mt-2 left-0 min-w-[260px] rounded-2xl border border-gs-lightgrey bg-gs-white p-5 shadow-[0_16px_48px_rgba(0,0,0,0.12)]">
          {children}
        </div>
      )}
    </div>
  );
}
