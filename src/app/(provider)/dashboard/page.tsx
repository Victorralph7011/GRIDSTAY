"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { useAuth } from "@/lib/firebase/useAuth";
import {
  subscribeToProviderProperties,
  type Property,
} from "@/lib/firebase/properties";
import { subscribeToBeds, type Bed } from "@/lib/firebase/beds";
import MarketplaceHeader from "@/components/marketplace/MarketplaceHeader";
import PriceBadge from "@/components/marketplace/PriceBadge";

interface PropertyRow {
  property: Property;
  beds: Bed[];
}

export default function ProviderDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [bedsByProperty, setBedsByProperty] = useState<Record<string, Bed[]>>({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    return subscribeToProviderProperties(
      user.uid,
      (props) => {
        setProperties(props);
        setLoading(false);
      },
      () => {
        setLoadError("Couldn't load your properties. Please try again.");
        setLoading(false);
      }
    );
  }, [user]);

  // One bed listener per property so occupancy stays live without a
  // collection-group query (which would need its own index).
  useEffect(() => {
    const unsubs = properties.map((p) =>
      subscribeToBeds(p.id, (beds) =>
        setBedsByProperty((prev) => ({ ...prev, [p.id]: beds }))
      )
    );
    return () => unsubs.forEach((u) => u());
  }, [properties]);

  const rows: PropertyRow[] = properties.map((property) => ({
    property,
    beds: bedsByProperty[property.id] ?? [],
  }));

  const allBeds = rows.flatMap((r) => r.beds);
  const occupied = allBeds.filter((b) => b.status === "occupied").length;
  const occupancyPct =
    allBeds.length > 0 ? Math.round((occupied / allBeds.length) * 100) : 0;
  const monthlyRevenue = allBeds
    .filter((b) => b.status === "occupied")
    .reduce((sum, b) => sum + b.monthlyRent, 0);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gs-white">
        <MarketplaceHeader />
        <p className="text-center text-gs-midgrey text-sm py-24">
          Loading your dashboard…
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gs-white text-gs-charcoal">
      <MarketplaceHeader />

      <div className="gs-container py-10 flex flex-col gap-8">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-[clamp(28px,4vw,40px)] tracking-[-0.02em]">
              Dashboard
            </h1>
            <p className="text-gs-midgrey text-[15px] mt-1">
              {user?.displayName?.trim() || "Your properties"}
            </p>
          </div>

          <Link
            href="/onboarding"
            className="flex items-center gap-2 bg-gs-charcoal text-white text-[12px] font-bold uppercase tracking-[0.08em] px-6 py-3 rounded-full no-underline hover:bg-gs-black transition-colors"
          >
            <Plus size={15} /> Add property
          </Link>
        </div>

        {loadError ? (
          <p className="text-gs-midgrey text-sm py-20 text-center">{loadError}</p>
        ) : properties.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center gap-3">
            <p className="text-gs-charcoal font-medium">No properties yet.</p>
            <p className="text-gs-midgrey text-sm max-w-sm">
              List your first hostel or PG to start receiving bookings.
            </p>
            <Link
              href="/onboarding"
              className="mt-2 bg-gs-charcoal text-white text-[12px] font-bold uppercase tracking-[0.08em] px-8 py-3.5 rounded-full no-underline hover:bg-gs-black transition-colors"
            >
              List your property
            </Link>
          </div>
        ) : (
          <>
            {/* Portfolio summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: "Properties", value: String(properties.length) },
                {
                  label: "Occupancy",
                  value: `${occupancyPct}%`,
                  sub: `${occupied} of ${allBeds.length} beds`,
                },
                {
                  label: "Monthly revenue",
                  value: new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: "INR",
                    maximumFractionDigits: 0,
                  }).format(monthlyRevenue),
                  sub: "from occupied beds",
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-gs-lightgrey p-5"
                >
                  <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-gs-midgrey mb-2">
                    {stat.label}
                  </p>
                  <p
                    className="text-3xl tracking-[-0.02em]"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {stat.value}
                  </p>
                  {stat.sub && (
                    <p className="text-[12px] text-gs-midgrey mt-1">{stat.sub}</p>
                  )}
                </div>
              ))}
            </div>

            {/* Property list */}
            <div className="flex flex-col divide-y divide-gs-lightgrey">
              {rows.map(({ property, beds }) => {
                const avail = beds.filter((b) => b.status === "available").length;
                return (
                  <Link
                    key={property.id}
                    href={`/properties/${property.id}`}
                    className="flex items-center justify-between gap-4 py-5 no-underline hover:bg-gs-offwhite -mx-4 px-4 rounded-xl transition-colors"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="text-[15px] font-semibold text-gs-charcoal">
                        {property.name}
                      </span>
                      <span className="text-[13px] text-gs-midgrey">
                        {property.city} · {beds.length} beds · {avail} available
                      </span>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <PriceBadge
                        amount={property.priceRange.min}
                        className="text-sm hidden sm:inline"
                      />
                      <span
                        className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.08em] ${
                          property.verified
                            ? "bg-gs-charcoal text-white"
                            : "bg-gs-offwhite text-gs-darkgrey"
                        }`}
                      >
                        {property.verified ? "Verified" : "Under review"}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
