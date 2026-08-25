"use client";

import { useMemo } from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useRouter } from "next/navigation";
import type { Property } from "@/lib/firebase/properties";

interface ExploreMapViewProps {
  properties: Property[];
  hoveredId: string | null;
  onHoverProperty: (id: string | null) => void;
}

const priceFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

/**
 * A self-centering price-badge marker. Rather than fight Leaflet's
 * iconSize/iconAnchor math for a pill whose width depends on the price
 * string, the wrapper is anchored at [0, 0] (exactly the lat/lng point)
 * and the inner element centers itself on that point with a CSS
 * transform — works for any label length with no anchor arithmetic.
 */
function makePriceIcon(amount: number, active: boolean): L.DivIcon {
  const label = priceFormatter.format(amount);
  return L.divIcon({
    html: `<div class="gs-map-pin${active ? " gs-map-pin--active" : ""}">${label}</div>`,
    className: "gs-map-pin-wrapper",
    iconSize: undefined,
    iconAnchor: [0, 0],
  });
}

/** OSM's usage policy requires visible attribution — kept in the
 * default bottom-right control rather than hidden or removed. */
const ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

export default function ExploreMapView({
  properties,
  hoveredId,
  onHoverProperty,
}: ExploreMapViewProps) {
  const router = useRouter();

  const center = useMemo((): [number, number] => {
    if (properties.length === 0) return [22.9734, 78.6569]; // India centroid fallback
    const lat =
      properties.reduce((sum, p) => sum + p.geopoint.lat, 0) / properties.length;
    const lng =
      properties.reduce((sum, p) => sum + p.geopoint.lng, 0) / properties.length;
    return [lat, lng];
  }, [properties]);

  return (
    <MapContainer
      center={center}
      zoom={properties.length > 1 ? 5 : 12}
      scrollWheelZoom
      className="w-full h-full"
    >
      <TileLayer
        attribution={ATTRIBUTION}
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {properties.map((property) => (
        <Marker
          key={property.id}
          position={[property.geopoint.lat, property.geopoint.lng]}
          icon={makePriceIcon(property.priceRange.min, hoveredId === property.id)}
          eventHandlers={{
            mouseover: () => onHoverProperty(property.id),
            mouseout: () => onHoverProperty(null),
            click: () => router.push(`/listing/${property.id}`),
          }}
        />
      ))}
    </MapContainer>
  );
}
