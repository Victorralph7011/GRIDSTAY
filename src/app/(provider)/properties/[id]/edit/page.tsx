"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useAuth } from "@/lib/firebase/useAuth";
import {
  getProperty,
  getRoomsByProperty,
  updateProperty,
  updateRoomRent,
  type Property,
  type Room,
} from "@/lib/firebase/properties";
import { AMENITY_OPTIONS } from "@/components/marketplace/amenities";
import MarketplaceHeader from "@/components/marketplace/MarketplaceHeader";

const inputClass =
  "w-full rounded-xl border border-gs-lightgrey bg-gs-white px-4 py-3 text-[15px] text-gs-charcoal placeholder:text-gs-midgrey focus:outline-none focus:border-gs-charcoal transition-colors";
const labelClass =
  "text-[11px] font-bold tracking-[0.1em] uppercase text-gs-midgrey";

export default function EditPropertyPage() {
  const params = useParams<{ id: string }>();
  const propertyId = Array.isArray(params.id) ? params.id[0] : params.id;
  const router = useRouter();
  const { user } = useAuth();

  const [property, setProperty] = useState<Property | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [photoInput, setPhotoInput] = useState("");
  const [campusInput, setCampusInput] = useState("");

  useEffect(() => {
    if (!propertyId) return;
    let cancelled = false;

    (async () => {
      try {
        const [prop, roomList] = await Promise.all([
          getProperty(propertyId),
          getRoomsByProperty(propertyId),
        ]);
        if (cancelled) return;
        setProperty(prop);
        setRooms(roomList);
        setLoading(false);
      } catch {
        if (cancelled) return;
        setLoadError("Couldn't load this property. Please try again.");
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [propertyId]);

  const patch = <K extends keyof Property>(key: K, value: Property[K]) =>
    setProperty((p) => (p ? { ...p, [key]: value } : p));

  const handleSave = async () => {
    if (!property) return;
    setSaving(true);
    setSaveError(null);

    try {
      // Only send the fields this form owns. verified / providerId /
      // ratings are frozen by the security rules — including them
      // would get the whole write rejected.
      await updateProperty(property.id, {
        name: property.name,
        description: property.description,
        address: property.address,
        city: property.city,
        campusNearby: property.campusNearby,
        amenities: property.amenities,
        coverImageUrl: property.coverImageUrl,
        photoUrls: property.photoUrls,
      });
      setSavedAt(new Date().toLocaleTimeString("en-IN"));
    } catch {
      setSaveError("Couldn't save your changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleRentChange = async (roomId: string, newRent: number) => {
    if (!property || newRent <= 0) return;
    const nextRooms = rooms.map((r) =>
      r.id === roomId ? { ...r, monthlyRent: newRent } : r
    );
    setRooms(nextRooms);
    setSaveError(null);

    try {
      await updateRoomRent(property.id, roomId, newRent, nextRooms);
      setSavedAt(new Date().toLocaleTimeString("en-IN"));
    } catch {
      setSaveError(
        "Couldn't update that price. It may still show the old value — reload and retry."
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gs-white">
        <MarketplaceHeader />
        <p className="text-center text-gs-midgrey text-sm py-24">Loading…</p>
      </div>
    );
  }

  if (loadError || !property) {
    return (
      <div className="min-h-screen bg-gs-white">
        <MarketplaceHeader />
        <p className="text-center text-gs-midgrey text-sm py-24">
          {loadError ?? "Property not found."}
        </p>
      </div>
    );
  }

  // Defense in depth — the (provider) layout guard already ensures a
  // signed-in provider, and the rules reject the write regardless.
  if (!user || property.providerId !== user.uid) {
    return (
      <div className="min-h-screen bg-gs-white">
        <MarketplaceHeader />
        <p className="text-center text-gs-charcoal font-medium py-24">
          You don&apos;t have access to this property.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gs-white text-gs-charcoal">
      <MarketplaceHeader />

      <div className="gs-container py-10 max-w-3xl flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <Link
            href={`/properties/${property.id}`}
            className="inline-flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-[0.08em] text-gs-midgrey hover:text-gs-charcoal no-underline w-fit"
          >
            <ChevronLeft size={14} /> Back to inventory
          </Link>
          <h1 className="text-[clamp(26px,3.4vw,36px)] tracking-[-0.02em]">
            Edit listing
          </h1>
          <p className="text-[13px] text-gs-midgrey">
            Verification status and ratings are set by GridStay and
            can&apos;t be edited here.
          </p>
        </div>

        {/* Details */}
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className={labelClass}>Property name</label>
            <input
              className={inputClass}
              value={property.name}
              onChange={(e) => patch("name", e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className={labelClass}>Description</label>
            <textarea
              className={`${inputClass} min-h-[120px] resize-y`}
              value={property.description}
              onChange={(e) => patch("description", e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className={labelClass}>Address</label>
            <input
              className={inputClass}
              value={property.address}
              onChange={(e) => patch("address", e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className={labelClass}>City</label>
            <input
              className={inputClass}
              value={property.city}
              onChange={(e) => patch("city", e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className={labelClass}>Nearby campuses</label>
            <div className="flex gap-2">
              <input
                className={inputClass}
                value={campusInput}
                onChange={(e) => setCampusInput(e.target.value)}
                placeholder="Add a campus"
              />
              <button
                type="button"
                onClick={() => {
                  if (!campusInput.trim()) return;
                  patch("campusNearby", [
                    ...property.campusNearby,
                    campusInput.trim(),
                  ]);
                  setCampusInput("");
                }}
                className="px-5 rounded-xl border border-gs-charcoal text-[12px] font-bold uppercase tracking-[0.06em] hover:bg-gs-charcoal hover:text-white transition-colors cursor-pointer"
              >
                Add
              </button>
            </div>
            {property.campusNearby.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-1">
                {property.campusNearby.map((c, i) => (
                  <span
                    key={`${c}-${i}`}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gs-offwhite text-[13px]"
                  >
                    {c}
                    <button
                      type="button"
                      onClick={() =>
                        patch(
                          "campusNearby",
                          property.campusNearby.filter((_, idx) => idx !== i)
                        )
                      }
                      className="text-gs-midgrey hover:text-gs-charcoal cursor-pointer"
                      aria-label={`Remove ${c}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className={labelClass}>Amenities</label>
            <div className="flex flex-wrap gap-2">
              {AMENITY_OPTIONS.map((a) => {
                const on = property.amenities.includes(a.key);
                return (
                  <button
                    key={a.key}
                    type="button"
                    onClick={() =>
                      patch(
                        "amenities",
                        on
                          ? property.amenities.filter((x) => x !== a.key)
                          : [...property.amenities, a.key]
                      )
                    }
                    className={`px-4 py-2.5 rounded-full border text-[11px] font-bold uppercase tracking-[0.08em] transition-colors cursor-pointer ${
                      on
                        ? "bg-gs-charcoal text-white border-gs-charcoal"
                        : "bg-transparent text-gs-charcoal border-gs-lightgrey hover:border-gs-midgrey"
                    }`}
                  >
                    {a.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className={labelClass}>Cover image URL</label>
            <input
              className={inputClass}
              value={property.coverImageUrl}
              onChange={(e) => patch("coverImageUrl", e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className={labelClass}>Gallery images</label>
            <div className="flex gap-2">
              <input
                className={inputClass}
                value={photoInput}
                onChange={(e) => setPhotoInput(e.target.value)}
                placeholder="https://…"
              />
              <button
                type="button"
                onClick={() => {
                  if (!photoInput.trim()) return;
                  patch("photoUrls", [...property.photoUrls, photoInput.trim()]);
                  setPhotoInput("");
                }}
                className="px-5 rounded-xl border border-gs-charcoal text-[12px] font-bold uppercase tracking-[0.06em] hover:bg-gs-charcoal hover:text-white transition-colors cursor-pointer"
              >
                Add
              </button>
            </div>
            {property.photoUrls.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {property.photoUrls.map((url, i) => (
                  <div key={`${url}-${i}`} className="relative">
                    {/* Providers can paste any host; next/image only
                        allows hosts declared in next.config.ts. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={`Gallery ${i + 1}`}
                      className="w-28 h-20 object-cover rounded-lg border border-gs-lightgrey"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        patch(
                          "photoUrls",
                          property.photoUrls.filter((_, idx) => idx !== i)
                        )
                      }
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gs-charcoal text-white text-xs cursor-pointer"
                      aria-label="Remove photo"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Pricing — saved immediately on change, since each edit
            fans out to the room, its beds and the property rollup. */}
        <div className="flex flex-col gap-3 pt-6 border-t border-gs-lightgrey">
          <h2 className="text-[15px] font-bold uppercase tracking-[0.06em]">
            Pricing
          </h2>
          <p className="text-[13px] text-gs-midgrey">
            Changing a rent updates that room, every bed in it, and the
            price shown on the marketplace. Saved as soon as you change it.
          </p>

          {rooms.map((room) => (
            <div
              key={room.id}
              className="flex items-center justify-between gap-4 py-3 border-b border-gs-lightgrey last:border-b-0"
            >
              <span className="text-[14px] font-semibold">
                {room.sharingType}-sharing
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[13px] text-gs-midgrey">₹</span>
                <input
                  type="number"
                  min={1}
                  className={`${inputClass} w-36`}
                  value={room.monthlyRent}
                  onChange={(e) =>
                    setRooms((rs) =>
                      rs.map((r) =>
                        r.id === room.id
                          ? { ...r, monthlyRent: Number(e.target.value) }
                          : r
                      )
                    )
                  }
                  onBlur={(e) =>
                    handleRentChange(room.id, Number(e.target.value))
                  }
                />
                <span className="text-[13px] text-gs-midgrey">/bed/mo</span>
              </div>
            </div>
          ))}
        </div>

        {/* Save */}
        <div className="flex items-center justify-between gap-4 pt-6 border-t border-gs-lightgrey">
          <div className="text-[13px]">
            {saveError ? (
              <span className="text-red-600">{saveError}</span>
            ) : savedAt ? (
              <span className="text-gs-midgrey">Saved at {savedAt}</span>
            ) : null}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push(`/properties/${property.id}`)}
              className="text-[12px] font-bold uppercase tracking-[0.08em] text-gs-midgrey hover:text-gs-charcoal cursor-pointer"
            >
              Done
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="bg-gs-charcoal text-white text-[12px] font-bold uppercase tracking-[0.1em] px-8 py-3.5 rounded-full disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gs-black transition-colors cursor-pointer"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
