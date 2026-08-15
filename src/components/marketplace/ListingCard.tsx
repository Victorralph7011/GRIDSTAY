"use client";

import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import type { Property } from "@/lib/firebase/properties";
import PriceBadge from "./PriceBadge";

interface ListingCardProps {
  property: Property;
  /** Highlights the card to mirror hovering its pin on the map. */
  isHovered?: boolean;
  onHover?: (id: string | null) => void;
}

export default function ListingCard({
  property,
  isHovered = false,
  onHover,
}: ListingCardProps) {
  return (
    <Link
      href={`/listing/${property.id}`}
      className="group block no-underline"
      onMouseEnter={() => onHover?.(property.id)}
      onMouseLeave={() => onHover?.(null)}
    >
      <div
        className={`relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-gs-lightgrey transition-shadow ${
          isHovered ? "ring-2 ring-gs-charcoal ring-offset-2" : ""
        }`}
      >
        <Image
          src={property.coverImageUrl}
          alt={property.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
        />

        {property.verified && (
          <div
            className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full"
            style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)" }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse-dot"
              style={{ background: "#4ADE80", boxShadow: "0 0 6px #4ADE80" }}
            />
            <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-white">
              Verified
            </span>
          </div>
        )}
      </div>

      <div className="pt-3.5 flex flex-col gap-1">
        <div className="flex items-start justify-between gap-3">
          <h3
            className="text-[15px] font-semibold leading-snug text-gs-charcoal"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {property.name}
          </h3>
          {property.ratingCount > 0 && (
            <span className="flex items-center gap-1 shrink-0 text-[13px] text-gs-charcoal tabular-nums">
              <Star size={12} fill="currentColor" strokeWidth={0} />
              {property.ratingAvg.toFixed(1)}
            </span>
          )}
        </div>

        <p className="text-[13px] text-gs-midgrey leading-snug">
          {property.campusNearby.length > 0
            ? `Near ${property.campusNearby[0]}`
            : property.city}
        </p>

        <p className="text-[13px] text-gs-midgrey">
          {property.sharingTypes
            .slice()
            .sort((a, b) => a - b)
            .map((t) => `${t}-sharing`)
            .join(" · ")}
        </p>

        <PriceBadge amount={property.priceRange.min} className="mt-1.5 text-[15px]" />
      </div>
    </Link>
  );
}
