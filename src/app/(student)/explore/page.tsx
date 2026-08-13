"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { subscribeToProperties, type Property } from "@/lib/firebase/properties";
import MarketplaceHeader from "@/components/marketplace/MarketplaceHeader";
import ListingCard from "@/components/marketplace/ListingCard";
import ListingCardSkeleton from "@/components/marketplace/ListingCardSkeleton";
import ExploreFilterBar, {
  DEFAULT_EXPLORE_FILTERS,
  type ExploreFilterState,
} from "@/components/marketplace/ExploreFilterBar";

export default function ExplorePage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ExploreFilterState>(
    DEFAULT_EXPLORE_FILTERS
  );

  useEffect(() => {
    const unsubscribe = subscribeToProperties(
      {},
      (props) => {
        setProperties(props);
        setLoading(false);
      },
      () => {
        setLoadError("Couldn't load stays right now. Please try again shortly.");
        setLoading(false);
      }
    );
    return unsubscribe;
  }, []);

  const filtered = useMemo(() => {
    const search = filters.campusSearch.trim().toLowerCase();

    return properties.filter((p) => {
      if (search) {
        const inCampus = p.campusNearby.some((c) =>
          c.toLowerCase().includes(search)
        );
        const inCity = p.city.toLowerCase().includes(search);
        const inName = p.name.toLowerCase().includes(search);
        if (!inCampus && !inCity && !inName) return false;
      }

      if (
        filters.sharingTypes.length > 0 &&
        !p.sharingTypes.some((t) => filters.sharingTypes.includes(t))
      ) {
        return false;
      }

      if (
        filters.amenities.length > 0 &&
        !filters.amenities.every((a) => p.amenities.includes(a))
      ) {
        return false;
      }

      if (
        p.priceRange.min > filters.priceMax ||
        p.priceRange.max < filters.priceMin
      ) {
        return false;
      }

      return true;
    });
  }, [properties, filters]);

  return (
    <div className="min-h-screen bg-gs-white text-gs-charcoal">
      <MarketplaceHeader />

      {/* Search hero */}
      <section className="gs-container pt-12 pb-8">
        <h1
          className="text-[clamp(34px,5vw,52px)] leading-[1.05] tracking-[-0.03em] mb-3"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Find your next stay
        </h1>
        <p className="text-gs-midgrey text-[15px] max-w-xl mb-7">
          Verified hostels, PGs and co-living spaces near your campus — with
          live, bed-level availability.
        </p>

        <div className="relative max-w-xl">
          <Search
            size={17}
            className="absolute left-5 top-1/2 -translate-y-1/2 text-gs-midgrey pointer-events-none"
          />
          <input
            type="text"
            value={filters.campusSearch}
            onChange={(e) =>
              setFilters({ ...filters, campusSearch: e.target.value })
            }
            placeholder="Search by campus, city or property"
            className="w-full rounded-full border border-gs-lightgrey bg-gs-white pl-12 pr-5 py-4 text-[15px] text-gs-charcoal placeholder:text-gs-midgrey shadow-[0_2px_16px_rgba(0,0,0,0.05)] focus:outline-none focus:border-gs-charcoal transition-colors"
          />
        </div>
      </section>

      <ExploreFilterBar
        filters={filters}
        onChange={setFilters}
        resultCount={filtered.length}
      />

      <section className="gs-container py-10">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
            {Array.from({ length: 6 }).map((_, i) => (
              <ListingCardSkeleton key={i} />
            ))}
          </div>
        ) : loadError ? (
          <p className="text-gs-midgrey text-sm py-20 text-center">{loadError}</p>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center gap-2">
            <p className="text-gs-charcoal font-medium">
              {properties.length === 0
                ? "No hostels listed yet."
                : "No stays match your filters."}
            </p>
            <p className="text-gs-midgrey text-sm">
              {properties.length === 0
                ? "Check back soon — new verified stays are added regularly."
                : "Try widening your price range or clearing a filter."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
            {filtered.map((property) => (
              <ListingCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
