"use client";

import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { GeoPoint } from "@/lib/firebase/properties";

interface LocationPickerProps {
  value: GeoPoint | null;
  onChange: (point: GeoPoint) => void;
}

/** Same self-centering pin approach as the explore map's price
 *  badges — anchored at [0,0], centered via CSS transform. */
const PIN_ICON = L.divIcon({
  html: `<div class="gs-map-pin gs-map-pin--active">Your hostel</div>`,
  className: "gs-map-pin-wrapper",
  iconSize: undefined,
  iconAnchor: [0, 0],
});

function ClickCapture({ onChange }: { onChange: (p: GeoPoint) => void }) {
  useMapEvents({
    click: (e) => onChange({ lat: e.latlng.lat, lng: e.latlng.lng }),
  });
  return null;
}

export default function LocationPicker({ value, onChange }: LocationPickerProps) {
  // India centroid until the provider drops a pin.
  const center: [number, number] = value
    ? [value.lat, value.lng]
    : [22.9734, 78.6569];

  return (
    <MapContainer
      center={center}
      zoom={value ? 15 : 4}
      scrollWheelZoom
      className="w-full h-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickCapture onChange={onChange} />
      {value && <Marker position={[value.lat, value.lng]} icon={PIN_ICON} />}
    </MapContainer>
  );
}
