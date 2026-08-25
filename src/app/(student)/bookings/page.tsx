"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/firebase/useAuth";
import {
  subscribeToStudentBookings,
  type Booking,
  type BookingStatus,
} from "@/lib/firebase/bookings";
import { getProperty, getRoomsByProperty, type Property, type Room } from "@/lib/firebase/properties";
import MarketplaceHeader from "@/components/marketplace/MarketplaceHeader";
import PriceBadge from "@/components/marketplace/PriceBadge";

const STATUS_LABEL: Record<BookingStatus, string> = {
  pending_esign: "Awaiting Signature",
  pending_payment: "Awaiting Payment",
  confirmed: "Confirmed",
  cancelled: "Cancelled",
};

const STATUS_CLASSES: Record<BookingStatus, string> = {
  pending_esign: "bg-gs-offwhite text-gs-darkgrey",
  pending_payment: "bg-gs-offwhite text-gs-darkgrey",
  confirmed: "bg-gs-charcoal text-white",
  cancelled: "bg-gs-lightgrey text-gs-midgrey",
};

interface EnrichedBooking {
  booking: Booking;
  property: Property | null;
  room: Room | null;
}

export default function MyBookingsPage() {
  const { user, loading: authLoading } = useAuth();
  const [rows, setRows] = useState<EnrichedBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    // property/room lookups per booking are cached across snapshots so
    // repeated bookings at the same property don't refetch it.
    const propertyCache = new Map<string, Promise<Property | null>>();
    const roomsCache = new Map<string, Promise<Room[]>>();

    const unsubscribe = subscribeToStudentBookings(
      user.uid,
      async (bookings) => {
        try {
          const enriched = await Promise.all(
            bookings.map(async (booking) => {
              if (!propertyCache.has(booking.propertyId)) {
                propertyCache.set(booking.propertyId, getProperty(booking.propertyId));
              }
              if (!roomsCache.has(booking.propertyId)) {
                roomsCache.set(booking.propertyId, getRoomsByProperty(booking.propertyId));
              }
              const [property, rooms] = await Promise.all([
                propertyCache.get(booking.propertyId)!,
                roomsCache.get(booking.propertyId)!,
              ]);
              const room = rooms.find((r) => r.id === booking.roomId) ?? null;
              return { booking, property, room };
            })
          );
          setRows(enriched);
          setLoading(false);
        } catch {
          setLoadError("Couldn't load your bookings. Please try again.");
          setLoading(false);
        }
      },
      () => {
        setLoadError("Couldn't load your bookings. Please try again.");
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [user]);

  if (authLoading || (loading && !loadError)) {
    return (
      <div className="min-h-screen bg-gs-white">
        <MarketplaceHeader />
        <p className="text-center text-gs-midgrey text-sm py-24">Loading your bookings…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gs-white">
        <MarketplaceHeader />
        <div className="flex flex-col items-center gap-3 py-24">
          <p className="text-gs-charcoal font-medium">Sign in to see your bookings.</p>
          <Link href="/auth/login" className="text-sm text-gs-midgrey underline">
            Log in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gs-white text-gs-charcoal">
      <MarketplaceHeader />

      <div className="gs-container py-10 flex flex-col gap-6">
        <h1 className="text-[clamp(28px,4vw,40px)] tracking-[-0.02em]">
          My Bookings
        </h1>

        {loadError ? (
          <p className="text-gs-midgrey text-sm py-16 text-center">{loadError}</p>
        ) : rows.length === 0 ? (
          <div className="py-16 text-center flex flex-col items-center gap-2">
            <p className="text-gs-charcoal font-medium">No bookings yet.</p>
            <Link href="/explore" className="text-sm text-gs-midgrey underline">
              Browse stays
            </Link>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-gs-lightgrey">
            {rows.map(({ booking, property, room }) => (
              <Link
                key={booking.id}
                href={
                  booking.status === "confirmed"
                    ? `/listing/${booking.propertyId}`
                    : `/booking/${booking.id}`
                }
                className="flex items-center justify-between gap-4 py-5 no-underline hover:bg-gs-offwhite -mx-4 px-4 rounded-xl transition-colors"
              >
                <div className="flex flex-col gap-1">
                  <span className="text-[15px] font-semibold text-gs-charcoal">
                    {property?.name ?? "Listing unavailable"}
                  </span>
                  <span className="text-[13px] text-gs-midgrey">
                    {room ? `${room.sharingType}-Sharing · ` : ""}
                    Move-in {booking.moveInDate}
                  </span>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  {room && <PriceBadge amount={room.monthlyRent} className="text-sm hidden sm:inline" />}
                  <span
                    className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.08em] ${STATUS_CLASSES[booking.status]}`}
                  >
                    {STATUS_LABEL[booking.status]}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
