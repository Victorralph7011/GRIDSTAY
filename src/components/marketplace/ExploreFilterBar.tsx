"use client";

import type { SharingType } from "@/lib/firebase/properties";
import FilterPopover from "./FilterPopover";
import { AMENITY_OPTIONS } from "./amenities";

export interface ExploreFilterState {
  campusSearch: string;
  sharingTypes: SharingType[];
  amenities: string[];
  priceMin: number;
  priceMax: number;
}

export const PRICE_FLOOR = 0;
export const PRICE_CEILING = 30000;

export const DEFAULT_EXPLORE_FILTERS: ExploreFilterState = {
  campusSearch: "",
  sharingTypes: [],
  amenities: [],
  priceMin: PRICE_FLOOR,
  priceMax: PRICE_CEILING,
};

const SHARING_OPTIONS: SharingType[] = [1, 2, 3, 4];

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

interface ExploreFilterBarProps {
  filters: ExploreFilterState;
  onChange: (filters: ExploreFilterState) => void;
  resultCount: number;
}

export default function ExploreFilterBar({
  filters,
  onChange,
  resultCount,
}: ExploreFilterBarProps) {
  const toggleSharing = (type: SharingType) =>
    onChange({
      ...filters,
      sharingTypes: filters.sharingTypes.includes(type)
        ? filters.sharingTypes.filter((t) => t !== type)
        : [...filters.sharingTypes, type],
    });

  const toggleAmenity = (key: string) =>
    onChange({
      ...filters,
      amenities: filters.amenities.includes(key)
        ? filters.amenities.filter((a) => a !== key)
        : [...filters.amenities, key],
    });

  const priceTouched =
    filters.priceMin !== PRICE_FLOOR || filters.priceMax !== PRICE_CEILING;

  const isFiltered =
    priceTouched ||
    filters.sharingTypes.length > 0 ||
    filters.amenities.length > 0 ||
    filters.campusSearch.trim() !== "";

  const pill = (active: boolean) =>
    `px-4 py-2.5 rounded-full border text-[11px] font-bold uppercase tracking-[0.08em] transition-colors cursor-pointer whitespace-nowrap ${
      active
        ? "bg-gs-charcoal text-gs-white border-gs-charcoal"
        : "bg-transparent text-gs-charcoal border-gs-lightgrey hover:border-gs-midgrey"
    }`;

  return (
    <div className="sticky top-[72px] z-30 bg-gs-white/95 backdrop-blur-md border-b border-gs-lightgrey">
      <div className="gs-container py-4 flex items-center gap-3 flex-wrap">
        {SHARING_OPTIONS.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => toggleSharing(type)}
            className={pill(filters.sharingTypes.includes(type))}
          >
            {type}-Sharing
          </button>
        ))}

        <span className="w-px h-6 bg-gs-lightgrey mx-1 hidden sm:block" />

        <FilterPopover
          label="Amenities"
          activeSummary={
            filters.amenities.length > 0
              ? `Amenities · ${filters.amenities.length}`
              : null
          }
        >
          <div className="flex flex-col gap-1">
            {AMENITY_OPTIONS.map((a) => {
              const checked = filters.amenities.includes(a.key);
              return (
                <label
                  key={a.key}
                  className="flex items-center gap-3 py-2 cursor-pointer group"
                >
                  <span
                    className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                      checked
                        ? "bg-gs-charcoal border-gs-charcoal"
                        : "border-gs-midgrey group-hover:border-gs-charcoal"
                    }`}
                  >
                    {checked && (
                      <svg viewBox="0 0 12 12" className="w-2.5 h-2.5" aria-hidden>
                        <path
                          d="M2 6.5L4.8 9 10 3.5"
                          fill="none"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </span>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleAmenity(a.key)}
                    className="sr-only"
                  />
                  <span className="text-sm text-gs-charcoal">{a.label}</span>
                </label>
              );
            })}
          </div>
        </FilterPopover>

        <FilterPopover
          label="Price"
          activeSummary={
            priceTouched
              ? `${inr.format(filters.priceMin)}–${inr.format(filters.priceMax)}`
              : null
          }
        >
          <div className="flex flex-col gap-4">
            <div className="flex items-baseline justify-between">
              <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-gs-midgrey">
                Per bed / month
              </span>
              <span className="text-sm font-semibold text-gs-charcoal">
                {inr.format(filters.priceMin)} – {inr.format(filters.priceMax)}
              </span>
            </div>

            <div className="flex flex-col gap-3">
              <label className="flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-[0.1em] text-gs-midgrey">
                  Minimum
                </span>
                <input
                  type="range"
                  min={PRICE_FLOOR}
                  max={PRICE_CEILING}
                  step={500}
                  value={filters.priceMin}
                  onChange={(e) =>
                    onChange({
                      ...filters,
                      priceMin: Math.min(
                        Number(e.target.value),
                        filters.priceMax
                      ),
                    })
                  }
                  className="w-full accent-[color:var(--color-gs-charcoal)] cursor-pointer"
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-[0.1em] text-gs-midgrey">
                  Maximum
                </span>
                <input
                  type="range"
                  min={PRICE_FLOOR}
                  max={PRICE_CEILING}
                  step={500}
                  value={filters.priceMax}
                  onChange={(e) =>
                    onChange({
                      ...filters,
                      priceMax: Math.max(
                        Number(e.target.value),
                        filters.priceMin
                      ),
                    })
                  }
                  className="w-full accent-[color:var(--color-gs-charcoal)] cursor-pointer"
                />
              </label>
            </div>
          </div>
        </FilterPopover>

        {isFiltered && (
          <button
            type="button"
            onClick={() => onChange(DEFAULT_EXPLORE_FILTERS)}
            className="text-[11px] font-bold uppercase tracking-[0.08em] text-gs-midgrey hover:text-gs-charcoal underline underline-offset-4 cursor-pointer"
          >
            Clear
          </button>
        )}

        <span className="ml-auto text-[12px] text-gs-midgrey whitespace-nowrap">
          {resultCount} {resultCount === 1 ? "stay" : "stays"}
        </span>
      </div>
    </div>
  );
}
