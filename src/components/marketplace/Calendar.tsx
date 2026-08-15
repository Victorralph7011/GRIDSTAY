"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarProps {
  /** Selected date as "YYYY-MM-DD", or null when nothing is picked. */
  value: string | null;
  onChange: (isoDate: string) => void;
  /** Earliest selectable date as "YYYY-MM-DD". */
  min?: string;
}

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/**
 * Build "YYYY-MM-DD" from local date parts. Never use toISOString()
 * for this — it converts to UTC first, so for IST (UTC+5:30) any
 * evening date comes back as tomorrow.
 */
export function toISODate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Parse "YYYY-MM-DD" as a *local* midnight date, not a UTC one. */
export function fromISODate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export default function Calendar({ value, onChange, min }: CalendarProps) {
  const initial = value ? fromISODate(value) : new Date();
  const [viewYear, setViewYear] = useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.getMonth());

  const { cells, canGoBack } = useMemo(() => {
    const firstOfMonth = new Date(viewYear, viewMonth, 1);
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const leadingBlanks = firstOfMonth.getDay();

    const list: (string | null)[] = Array(leadingBlanks).fill(null);
    for (let day = 1; day <= daysInMonth; day++) {
      list.push(toISODate(new Date(viewYear, viewMonth, day)));
    }

    // Don't let the user page back before the month containing `min`.
    const minDate = min ? fromISODate(min) : null;
    const back =
      !minDate ||
      viewYear > minDate.getFullYear() ||
      (viewYear === minDate.getFullYear() && viewMonth > minDate.getMonth());

    return { cells: list, canGoBack: back };
  }, [viewYear, viewMonth, min]);

  const step = (delta: number) => {
    const next = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(next.getFullYear());
    setViewMonth(next.getMonth());
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={() => step(-1)}
          disabled={!canGoBack}
          aria-label="Previous month"
          className="w-8 h-8 rounded-full flex items-center justify-center text-gs-charcoal hover:bg-gs-offwhite disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
        >
          <ChevronLeft size={16} />
        </button>

        <span className="text-[13px] font-bold text-gs-charcoal">
          {MONTH_NAMES[viewMonth]} {viewYear}
        </span>

        <button
          type="button"
          onClick={() => step(1)}
          aria-label="Next month"
          className="w-8 h-8 rounded-full flex items-center justify-center text-gs-charcoal hover:bg-gs-offwhite cursor-pointer"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAYS.map((d, i) => (
          <span
            key={i}
            className="text-center text-[10px] font-bold uppercase tracking-wide text-gs-midgrey py-1"
          >
            {d}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((iso, i) => {
          if (!iso) return <span key={`blank-${i}`} />;

          const disabled = min ? iso < min : false;
          const selected = iso === value;
          const dayNum = Number(iso.slice(8, 10));

          return (
            <button
              key={iso}
              type="button"
              disabled={disabled}
              onClick={() => onChange(iso)}
              className={`aspect-square rounded-full text-[13px] flex items-center justify-center transition-colors ${
                selected
                  ? "bg-gs-charcoal text-white font-bold"
                  : disabled
                    ? "text-gs-lightgrey cursor-not-allowed"
                    : "text-gs-charcoal hover:bg-gs-offwhite cursor-pointer"
              }`}
            >
              {dayNum}
            </button>
          );
        })}
      </div>
    </div>
  );
}
