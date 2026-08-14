"use client";

import { useState } from "react";
import type { Bed } from "@/lib/firebase/beds";
import type { Room } from "@/lib/firebase/properties";
import PriceBadge from "./PriceBadge";

interface BookingWidgetProps {
  selectedBed: Bed | null;
  selectedRoom: Room | null;
  onReserve: (moveInDate: string) => void;
  isReserving?: boolean;
}

// `toISOString()` converts to UTC first, so for IST users (UTC+5:30)
// anytime after ~6:30pm local time it returns tomorrow's date, or
// before 5:30am returns yesterday's — either way the wrong "today" for
// a move-in-date floor. Build the string from local date parts instead.
const todayISO = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function BookingWidget({
  selectedBed,
  selectedRoom,
  onReserve,
  isReserving = false,
}: BookingWidgetProps) {
  const [moveInDate, setMoveInDate] = useState(todayISO());

  return (
    <div className="listing-card p-6 flex flex-col gap-5 sticky top-24">
      {selectedRoom ? (
        <>
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-bold uppercase tracking-[0.06em] text-gs-charcoal">
              {selectedRoom.sharingType}-Sharing · Bed {selectedBed?.position}
            </span>
            <PriceBadge amount={selectedRoom.monthlyRent} />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-bold tracking-[0.1em] uppercase text-gs-midgrey">
              Move-in Date
            </label>
            <input
              type="date"
              min={todayISO()}
              value={moveInDate}
              onChange={(e) => setMoveInDate(e.target.value)}
              className="glass-input"
            />
          </div>

          <button
            type="button"
            disabled={!selectedBed || !moveInDate || isReserving}
            onClick={() => onReserve(moveInDate)}
            className="w-full bg-gs-charcoal text-white font-bold uppercase tracking-[0.1em] py-4 rounded-full disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {isReserving ? "Reserving…" : "Reserve Bed"}
          </button>

          <p className="text-xs text-gs-midgrey">
            You won&apos;t be charged yet — this holds your spot while you
            complete eSign and payment.
          </p>
        </>
      ) : (
        <p className="text-sm text-gs-midgrey">
          Select an available bed below to see pricing and reserve.
        </p>
      )}
    </div>
  );
}
