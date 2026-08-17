"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/firebase/useAuth";
import {
  subscribeToProviderProperties,
  type Property,
} from "@/lib/firebase/properties";
import {
  subscribeToPropertyBookings,
  type Booking,
} from "@/lib/firebase/bookings";
import MarketplaceHeader from "@/components/marketplace/MarketplaceHeader";
import PriceBadge from "@/components/marketplace/PriceBadge";
import { fromISODate } from "@/components/marketplace/Calendar";

interface TenantRow {
  booking: Booking;
  property: Property;
}

/** Lease end derived the same way the eSign contract computes it. */
function leaseEnd(moveInDate: string, tenureMonths?: number): string {
  const d = fromISODate(moveInDate);
  d.setMonth(d.getMonth() + (tenureMonths ?? 11));
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function TenantsPage() {
  const { user, loading: authLoading } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [bookingsByProperty, setBookingsByProperty] = useState<
    Record<string, Booking[]>
  >({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    return subscribeToProviderProperties(
      user.uid,
      (props) => {
        setProperties(props);
        setLoading(false);
      },
      () => setLoading(false)
    );
  }, [user]);

  // One listener per property — the bookings read rule authorizes via
  // the property's owner, so there's no single provider-wide query.
  useEffect(() => {
    const unsubs = properties.map((p) =>
      subscribeToPropertyBookings(p.id, (bookings) =>
        setBookingsByProperty((prev) => ({ ...prev, [p.id]: bookings }))
      )
    );
    return () => unsubs.forEach((u) => u());
  }, [properties]);

  const rows: TenantRow[] = properties.flatMap((property) =>
    (bookingsByProperty[property.id] ?? []).map((booking) => ({
      booking,
      property,
    }))
  );

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gs-white">
        <MarketplaceHeader />
        <p className="text-center text-gs-midgrey text-sm py-24">
          Loading tenants…
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gs-white text-gs-charcoal">
      <MarketplaceHeader />

      <div className="gs-container py-10 flex flex-col gap-6">
        <div>
          <h1 className="text-[clamp(28px,4vw,40px)] tracking-[-0.02em]">
            Tenants
          </h1>
          <p className="text-gs-midgrey text-[15px] mt-1">
            {rows.length} active {rows.length === 1 ? "tenancy" : "tenancies"}
          </p>
        </div>

        {rows.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center gap-2">
            <p className="text-gs-charcoal font-medium">No tenants yet.</p>
            <p className="text-gs-midgrey text-sm max-w-sm">
              Confirmed bookings appear here once students complete signing
              and payment.
            </p>
            <Link
              href="/dashboard"
              className="text-sm text-gs-midgrey underline mt-2"
            >
              Back to dashboard
            </Link>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-gs-lightgrey">
            {rows.map(({ booking, property }) => (
              <div
                key={booking.id}
                className="flex items-center justify-between gap-4 py-5 flex-wrap"
              >
                <div className="flex flex-col gap-1 min-w-[200px]">
                  <span className="text-[15px] font-semibold text-gs-charcoal">
                    {booking.studentName?.trim() || "Tenant"}
                  </span>
                  <span className="text-[13px] text-gs-midgrey">
                    {booking.studentEmail || "Contact unavailable"}
                  </span>
                </div>

                <div className="flex flex-col gap-1">
                  <Link
                    href={`/properties/${property.id}`}
                    className="text-[14px] text-gs-charcoal no-underline hover:underline"
                  >
                    {property.name}
                  </Link>
                  <span className="text-[13px] text-gs-midgrey">
                    Moved in {booking.moveInDate} · until{" "}
                    {leaseEnd(booking.moveInDate, booking.tenureMonths)}
                  </span>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <PriceBadge
                    amount={
                      // Rent lives on the room; the booking records the
                      // bed. Fall back to the property's floor price
                      // when the room isn't loaded here.
                      property.priceRange.min
                    }
                    className="text-sm hidden sm:inline"
                  />
                  <span className="px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.08em] bg-gs-charcoal text-white">
                    Active
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
