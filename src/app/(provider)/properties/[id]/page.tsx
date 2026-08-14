"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getProperty, getRoomsByProperty, type Property, type Room } from "@/lib/firebase/properties";
import { subscribeToBeds, updateBedStatus, type Bed } from "@/lib/firebase/beds";
import { useAuth } from "@/lib/firebase/useAuth";
import BedAvailabilityGrid from "@/components/marketplace/BedAvailabilityGrid";

export default function ProviderPropertyInventoryPage() {
  const params = useParams<{ id: string }>();
  const propertyId = Array.isArray(params.id) ? params.id[0] : params.id;
  const { user } = useAuth();

  const [property, setProperty] = useState<Property | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [beds, setBeds] = useState<Bed[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

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

  useEffect(() => {
    if (!propertyId) return;
    return subscribeToBeds(propertyId, setBeds);
  }, [propertyId]);

  const runAction = async (action: () => Promise<void>) => {
    setActionError(null);
    try {
      await action();
    } catch {
      setActionError("That update didn't go through. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gs-midgrey text-sm">
        Loading property…
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

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gs-charcoal font-medium">
        Property not found.
      </div>
    );
  }

  // RoleGuard on the (provider) layout already guarantees `user` is a
  // signed-in provider by the time this renders — `!user` here is
  // defense in depth, not the primary gate. The bug this replaces was
  // `user && property.providerId !== user.uid`: when `user` was null
  // (signed out, or auth still resolving), the whole check short-
  // circuited to false and let the request through, exposing tenant
  // IDs and inventory controls to anyone.
  if (!user || property.providerId !== user.uid) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gs-charcoal font-medium">
        You don&apos;t have access to this property.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gs-white text-gs-charcoal">
      <div className="gs-container py-10 flex flex-col gap-8">
        <div>
          <h1 className="text-3xl mb-1">{property.name}</h1>
          <p className="text-gs-midgrey text-sm">Bed-level inventory</p>
        </div>

        {actionError && <p className="text-sm text-red-600">{actionError}</p>}

        <BedAvailabilityGrid
          rooms={rooms}
          beds={beds}
          mode="edit"
          onSetMaintenance={(bed, inMaintenance) =>
            runAction(() =>
              updateBedStatus(bed.id, inMaintenance ? "maintenance" : "available")
            )
          }
          onAssignTenant={(bed, tenantId) =>
            runAction(() => updateBedStatus(bed.id, "occupied", tenantId))
          }
          onRemoveTenant={(bed) =>
            runAction(() => updateBedStatus(bed.id, "available"))
          }
        />
      </div>
    </div>
  );
}
