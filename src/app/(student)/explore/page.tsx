"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Search, List, Map as MapIcon } from "lucide-react";
import { subscribeToProperties, type Property } from "@/lib/firebase/properties";
import MarketplaceHeader from "@/components/marketplace/MarketplaceHeader";
import ListingCard from "@/components/marketplace/ListingCard";
import ListingCardSkeleton from "@/components/marketplace/ListingCardSkeleton";
import ExploreFilterBar, {
  DEFAULT_EXPLORE_FILTERS,
  type ExploreFilterState,
} from "@/components/marketplace/ExploreFilterBar";

// Leaflet touches `window` at module load, so it can never run during
// SSR/static generation — ssr:false is required here, not optional.
const ExploreMapView = dynamic(
  () => import("@/components/marketplace/ExploreMapView"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-gs-offwhite animate-pulse" />
    ),
  }
);

export default function ExplorePage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ExploreFilterState>(
    DEFAULT_EXPLORE_FILTERS
  );
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  // Mobile only — desktop always shows both panes side by side.
  const [mobileView, setMobileView] = useState<"list" | "map">("list");
  const [isDesktop, setIsDesktop] = useState(false);

  // Leaflet measures its container on init and on every pan/zoom. If
  // it's merely CSS-hidden (display:none) it initialises at zero size
  // and its internal position cache breaks — the map then throws
  // "_leaflet_pos of undefined" on interaction. So the map has to be
  // genuinely unmounted when off-screen rather than hidden, which
  // means tracking the breakpoint in JS instead of Tailwind alone.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const sync = () => setIsDesktop(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

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
        {/* Mobile list/map toggle — desktop always shows both panes
            side by side, so this only matters below the lg breakpoint. */}
        {!loading && !loadError && filtered.length > 0 && (
          <div className="lg:hidden flex justify-center mb-6">
            <div className="inline-flex rounded-full border border-gs-lightgrey p-1 gap-1">
              <button
                type="button"
                onClick={() => setMobileView("list")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-[0.08em] transition-colors cursor-pointer ${
                  mobileView === "list"
                    ? "bg-gs-charcoal text-white"
                    : "text-gs-midgrey"
                }`}
              >
                <List size={13} /> List
              </button>
              <button
                type="button"
                onClick={() => setMobileView("map")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-[0.08em] transition-colors cursor-pointer ${
                  mobileView === "map"
                    ? "bg-gs-charcoal text-white"
                    : "text-gs-midgrey"
                }`}
              >
                <MapIcon size={13} /> Map
              </button>
            </div>
          </div>
        )}

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
          <div className="flex flex-col lg:flex-row gap-8 lg:h-[72vh]">
            {/* List pane — CSS-hiding is fine here (unlike the map,
                which must unmount), so scroll position survives a
                toggle back to the list on mobile. */}
            <div
              className={`${!isDesktop && mobileView === "map" ? "hidden" : "block"} lg:w-[56%] lg:h-full lg:overflow-y-auto lg:pr-2`}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-10">
                {filtered.map((property) => (
                  <ListingCard
                    key={property.id}
                    property={property}
                    isHovered={hoveredId === property.id}
                    onHover={setHoveredId}
                  />
                ))}
              </div>
            </div>

            {/* Map pane — sticky so it stays put while the list
                scrolls, same as Airbnb's split view. Mounted only when
                actually visible; see the isDesktop note above. */}
            {(isDesktop || mobileView === "map") && (
              <div className="lg:w-[44%] h-[480px] lg:h-full lg:sticky lg:top-[156px] rounded-2xl overflow-hidden border border-gs-lightgrey">
                <ExploreMapView
                  properties={filtered.filter((p) => p.geopoint)}
                  hoveredId={hoveredId}
                  onHoverProperty={setHoveredId}
                />
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
