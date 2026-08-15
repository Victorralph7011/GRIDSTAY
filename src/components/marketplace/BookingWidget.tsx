"use client";

import { useState } from "react";
import type { Bed } from "@/lib/firebase/beds";
import type { Room } from "@/lib/firebase/properties";
import PriceBadge from "./PriceBadge";
import Calendar, { toISODate, fromISODate } from "./Calendar";

/** Tenure options in months. GridStay rents by the month, not the
 *  night — 11 months is the Indian rental-agreement convention
 *  (12+ triggers mandatory registration), so it stays the default. */
export const TENURE_OPTIONS = [3, 6, 11] as const;
export type TenureMonths = (typeof TENURE_OPTIONS)[number];

interface BookingWidgetProps {
  selectedBed: Bed | null;
  selectedRoom: Room | null;
  onReserve: (moveInDate: string, tenureMonths: TenureMonths) => void;
  isReserving?: boolean;
}

const todayISO = () => toISODate(new Date());

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

/** Human-readable end date, derived the same way the eSign contract
 *  computes its term so the two can't disagree. */
function formatEndDate(startISO: string, months: number): string {
  const d = fromISODate(startISO);
  d.setMonth(d.getMonth() + months);
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function BookingWidget({
  selectedBed,
  selectedRoom,
  onReserve,
  isReserving = false,
}: BookingWidgetProps) {
  const [moveInDate, setMoveInDate] = useState(todayISO());
  const [tenure, setTenure] = useState<TenureMonths>(11);

  if (!selectedRoom) {
    return (
      <div className="listing-card p-6 sticky top-24">
        <p className="text-sm text-gs-midgrey">
          Select an available bed below to see pricing and reserve.
        </p>
      </div>
    );
  }

  const rent = selectedRoom.monthlyRent;
  const deposit = rent * 2;

  return (
    <div className="listing-card p-6 flex flex-col gap-5 sticky top-24">
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-bold uppercase tracking-[0.06em] text-gs-charcoal">
          {selectedRoom.sharingType}-Sharing · Bed {selectedBed?.position}
        </span>
        <PriceBadge amount={rent} />
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-[11px] font-bold tracking-[0.1em] uppercase text-gs-midgrey">
          Move-in Date
        </span>
        <div className="rounded-xl border border-gs-lightgrey p-3">
          <Calendar
            value={moveInDate}
            onChange={setMoveInDate}
            min={todayISO()}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-[11px] font-bold tracking-[0.1em] uppercase text-gs-midgrey">
          Tenure
        </span>
        <div className="grid grid-cols-3 gap-2">
          {TENURE_OPTIONS.map((months) => (
            <button
              key={months}
              type="button"
              onClick={() => setTenure(months)}
              className={`py-2.5 rounded-xl text-[12px] font-bold uppercase tracking-[0.06em] border transition-colors cursor-pointer ${
                tenure === months
                  ? "bg-gs-charcoal text-white border-gs-charcoal"
                  : "bg-transparent text-gs-charcoal border-gs-lightgrey hover:border-gs-midgrey"
              }`}
            >
              {months} mo
            </button>
          ))}
        </div>
        <p className="text-[12px] text-gs-midgrey">
          Ends {formatEndDate(moveInDate, tenure)}
        </p>
      </div>

      {/* Price breakdown — deposit is charged once, rent recurs
          monthly, so they're shown separately rather than summed into
          a single misleading total. */}
      <div className="flex flex-col gap-2 pt-1 border-t border-gs-lightgrey">
        <div className="flex justify-between text-[13px] text-gs-darkgrey pt-3">
          <span>Monthly rent</span>
          <span className="tabular-nums">{inr.format(rent)}</span>
        </div>
        <div className="flex justify-between text-[13px] text-gs-darkgrey">
          <span>Security deposit (refundable)</span>
          <span className="tabular-nums">{inr.format(deposit)}</span>
        </div>
        <div className="flex justify-between text-[13px] font-bold text-gs-charcoal pt-2 border-t border-gs-lightgrey">
          <span>Due at move-in</span>
          <span className="tabular-nums">{inr.format(rent + deposit)}</span>
        </div>
      </div>

      <button
        type="button"
        disabled={!selectedBed || !moveInDate || isReserving}
        onClick={() => onReserve(moveInDate, tenure)}
        className="w-full bg-gs-charcoal text-white font-bold uppercase tracking-[0.1em] py-4 rounded-full disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer hover:bg-gs-black transition-colors"
      >
        {isReserving ? "Reserving…" : "Reserve Bed"}
      </button>

      <p className="text-xs text-gs-midgrey">
        You won&apos;t be charged yet — this holds your spot while you
        complete eSign and payment.
      </p>
    </div>
  );
}
