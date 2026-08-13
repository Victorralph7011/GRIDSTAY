"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Star } from "lucide-react";
import {
  getProperty,
  getRoomsByProperty,
  getReviewsByProperty,
  type Property,
  type Room,
  type Review,
} from "@/lib/firebase/properties";
import { subscribeToBeds, type Bed } from "@/lib/firebase/beds";
import { createPendingBooking } from "@/lib/firebase/bookings";
import { useAuth } from "@/lib/firebase/useAuth";
import MarketplaceHeader from "@/components/marketplace/MarketplaceHeader";
import PhotoGallery from "@/components/marketplace/PhotoGallery";
import BedAvailabilityGrid from "@/components/marketplace/BedAvailabilityGrid";
import BookingWidget from "@/components/marketplace/BookingWidget";
import ReviewList from "@/components/marketplace/ReviewList";
import { amenityLabel } from "@/components/marketplace/amenities";

export default function ListingDetailPage() {
  const params = useParams<{ id: string }>();
  const propertyId = Array.isArray(params.id) ? params.id[0] : params.id;
  const router = useRouter();
  const { user } = useAuth();

  const [property, setProperty] = useState<Property | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [beds, setBeds] = useState<Bed[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedBedId, setSelectedBedId] = useState<string | null>(null);
  const [isReserving, setIsReserving] = useState(false);
  const [reserveError, setReserveError] = useState<string | null>(null);

  useEffect(() => {
    if (!propertyId) return;
    let cancelled = false;

    (async () => {
      try {
        const [prop, roomList, reviewList] = await Promise.all([
          getProperty(propertyId),
          getRoomsByProperty(propertyId),
          getReviewsByProperty(propertyId),
        ]);
        if (cancelled) return;
        if (!prop) {
          setNotFound(true);
          setLoading(false);
          return;
        }
        setProperty(prop);
        setRooms(roomList);
        setReviews(reviewList);
        setLoading(false);
      } catch {
        if (cancelled) return;
        setLoadError("Couldn't load this listing. Please try again.");
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [propertyId]);

  useEffect(() => {
    if (!propertyId) return;
    return subscribeToBeds(propertyId, setBeds);
  }, [propertyId]);

  const selectedBed = useMemo(
    () => beds.find((b) => b.id === selectedBedId) ?? null,
    [beds, selectedBedId]
  );
  const selectedRoom = useMemo(
    () => rooms.find((r) => r.id === selectedBed?.roomId) ?? null,
    [rooms, selectedBed]
  );

  const handleReserve = async (moveInDate: string) => {
    if (!selectedBed || !selectedRoom || !property) return;
    if (!user) {
      router.push("/auth/login");
      return;
    }
    setIsReserving(true);
    setReserveError(null);
    try {
      const bookingId = await createPendingBooking({
        studentId: user.uid,
        propertyId: property.id,
        roomId: selectedRoom.id,
        bedId: selectedBed.id,
        moveInDate,
      });
      router.push(`/booking/${bookingId}`);
    } catch {
      setReserveError("Couldn't start your reservation. Please try again.");
      setIsReserving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gs-midgrey text-sm">
        Loading listing…
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gs-midgrey text-sm">
        {loadError}
      </div>
    );
  }

  if (notFound || !property) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3">
        <p className="text-gs-charcoal font-medium">Listing not found.</p>
        <Link href="/explore" className="text-sm text-gs-midgrey underline">
          Back to Explore
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gs-white text-gs-charcoal">
      <MarketplaceHeader />

      <div className="gs-container py-8 flex flex-col gap-6">
        {/* Title block sits above the gallery, Airbnb-style, so the
            listing identifies itself before the imagery loads. */}
        <div className="flex flex-col gap-2">
          <Link
            href="/explore"
            className="inline-flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-[0.08em] text-gs-midgrey hover:text-gs-charcoal transition-colors no-underline w-fit"
          >
            <ChevronLeft size={14} /> Back to Explore
          </Link>

          <h1 className="text-[clamp(26px,3.4vw,38px)] leading-tight tracking-[-0.02em]">
            {property.name}
          </h1>

          <div className="flex items-center gap-2 text-[13px] text-gs-midgrey flex-wrap">
            {property.ratingCount > 0 && (
              <>
                <span className="flex items-center gap-1 text-gs-charcoal font-semibold">
                  <Star size={12} fill="currentColor" strokeWidth={0} />
                  {property.ratingAvg.toFixed(1)}
                </span>
                <span>·</span>
                <span>{property.ratingCount} reviews</span>
                <span>·</span>
              </>
            )}
            <span>{property.address}</span>
            {property.verified && (
              <>
                <span>·</span>
                <span className="inline-flex items-center gap-1.5 text-gs-charcoal font-semibold">
                  <span
                    className="w-1.5 h-1.5 rounded-full animate-pulse-dot"
                    style={{ background: "#4ADE80", boxShadow: "0 0 6px #4ADE80" }}
                  />
                  Verified
                </span>
              </>
            )}
          </div>
        </div>

        <PhotoGallery
          photoUrls={property.photoUrls}
          propertyName={property.name}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-2">
          <div className="lg:col-span-2 flex flex-col divide-y divide-gs-lightgrey">
            <p className="text-gs-darkgrey leading-[1.75] pb-8">
              {property.description}
            </p>

            {property.amenities.length > 0 && (
              <div className="py-8">
                <h2 className="text-[15px] font-bold uppercase tracking-[0.06em] mb-4">
                  What this place offers
                </h2>
                <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                  {property.amenities.map((a) => (
                    <span key={a} className="text-[14px] text-gs-darkgrey">
                      {amenityLabel(a)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="py-8">
              <h2 className="text-[15px] font-bold uppercase tracking-[0.06em] mb-1">
                Choose your bed
              </h2>
              <p className="text-[13px] text-gs-midgrey mb-5">
                Availability updates live — pick any open bed to reserve it.
              </p>
              <BedAvailabilityGrid
                rooms={rooms}
                beds={beds}
                mode="select"
                selectedBedId={selectedBedId}
                onSelectBed={(bed) => setSelectedBedId(bed.id)}
              />
            </div>

            <div className="py-8">
              <h2 className="text-[15px] font-bold uppercase tracking-[0.06em] mb-4">
                Reviews
              </h2>
              <ReviewList reviews={reviews} />
            </div>
          </div>

          <div>
            <BookingWidget
              selectedBed={selectedBed}
              selectedRoom={selectedRoom}
              onReserve={handleReserve}
              isReserving={isReserving}
            />
            {reserveError && (
              <p className="text-sm text-red-600 mt-3">{reserveError}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
