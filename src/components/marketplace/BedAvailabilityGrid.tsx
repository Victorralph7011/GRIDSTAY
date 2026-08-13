"use client";

import { useState } from "react";
import type { Bed } from "@/lib/firebase/beds";
import type { Room } from "@/lib/firebase/properties";
import PriceBadge from "./PriceBadge";

interface BedAvailabilityGridProps {
  rooms: Room[];
  beds: Bed[];
  /** "select": student picks an available bed to reserve.
   *  "edit": provider manages status/tenant per bed. */
  mode: "select" | "edit";
  selectedBedId?: string | null;
  onSelectBed?: (bed: Bed) => void;
  /** Flip a bed between "available" and "maintenance". */
  onSetMaintenance?: (bed: Bed, inMaintenance: boolean) => void;
  /** Manually assign a tenant to an available bed. */
  onAssignTenant?: (bed: Bed, tenantId: string) => void;
  /** Clear an occupied bed back to available. */
  onRemoveTenant?: (bed: Bed) => void;
}

const STATUS_LABEL: Record<Bed["status"], string> = {
  available: "Available",
  occupied: "Occupied",
  maintenance: "Maintenance",
};

function bedTileClasses(status: Bed["status"]) {
  const base =
    "w-16 h-16 rounded-xl border flex flex-col items-center justify-center gap-0.5 text-[10px] font-bold uppercase tracking-wide";
  const statusClasses =
    status === "available"
      ? "border-gs-lightgrey text-gs-charcoal bg-gs-white"
      : status === "occupied"
        ? "border-gs-charcoal bg-gs-charcoal text-white"
        : "border-gs-lightgrey bg-gs-offwhite text-gs-midgrey";
  return `${base} ${statusClasses}`;
}

function EditableBed({
  bed,
  onSetMaintenance,
  onAssignTenant,
  onRemoveTenant,
}: {
  bed: Bed;
  onSetMaintenance?: (bed: Bed, inMaintenance: boolean) => void;
  onAssignTenant?: (bed: Bed, tenantId: string) => void;
  onRemoveTenant?: (bed: Bed) => void;
}) {
  const [assigning, setAssigning] = useState(false);
  const [tenantId, setTenantId] = useState("");

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={bedTileClasses(bed.status)} title={STATUS_LABEL[bed.status]}>
        <span>Bed {bed.position}</span>
        <span className="opacity-70">{STATUS_LABEL[bed.status]}</span>
      </div>

      {bed.status === "available" && !assigning && (
        <div className="flex flex-col gap-1 items-center">
          <button
            type="button"
            onClick={() => setAssigning(true)}
            className="text-[10px] font-bold uppercase tracking-wide text-gs-charcoal underline cursor-pointer"
          >
            Assign Tenant
          </button>
          <button
            type="button"
            onClick={() => onSetMaintenance?.(bed, true)}
            className="text-[10px] font-bold uppercase tracking-wide text-gs-midgrey underline cursor-pointer"
          >
            Mark Maintenance
          </button>
        </div>
      )}

      {bed.status === "available" && assigning && (
        <div className="flex flex-col gap-1 items-center w-24">
          <input
            type="text"
            value={tenantId}
            onChange={(e) => setTenantId(e.target.value)}
            placeholder="Student UID"
            className="glass-input text-xs text-center"
          />
          <div className="flex gap-2">
            <button
              type="button"
              disabled={!tenantId.trim()}
              onClick={() => {
                onAssignTenant?.(bed, tenantId.trim());
                setAssigning(false);
                setTenantId("");
              }}
              className="text-[10px] font-bold uppercase tracking-wide text-gs-charcoal underline cursor-pointer disabled:opacity-40"
            >
              Confirm
            </button>
            <button
              type="button"
              onClick={() => {
                setAssigning(false);
                setTenantId("");
              }}
              className="text-[10px] font-bold uppercase tracking-wide text-gs-midgrey underline cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {bed.status === "maintenance" && (
        <button
          type="button"
          onClick={() => onSetMaintenance?.(bed, false)}
          className="text-[10px] font-bold uppercase tracking-wide text-gs-charcoal underline cursor-pointer"
        >
          Mark Available
        </button>
      )}

      {bed.status === "occupied" && (
        <button
          type="button"
          onClick={() => onRemoveTenant?.(bed)}
          className="text-[10px] font-bold uppercase tracking-wide text-gs-charcoal underline cursor-pointer"
        >
          Remove Tenant
        </button>
      )}
    </div>
  );
}

export default function BedAvailabilityGrid({
  rooms,
  beds,
  mode,
  selectedBedId,
  onSelectBed,
  onSetMaintenance,
  onAssignTenant,
  onRemoveTenant,
}: BedAvailabilityGridProps) {
  const bedsByRoom = new Map<string, Bed[]>();
  for (const bed of beds) {
    const list = bedsByRoom.get(bed.roomId) ?? [];
    list.push(bed);
    bedsByRoom.set(bed.roomId, list);
  }

  return (
    <div className="flex flex-col gap-6">
      {rooms.map((room) => {
        const roomBeds = (bedsByRoom.get(room.id) ?? []).sort(
          (a, b) => a.position - b.position
        );

        return (
          <div key={room.id} className="flex flex-col gap-3">
            <div className="flex items-baseline justify-between">
              <h4 className="text-sm font-bold uppercase tracking-[0.06em] text-gs-charcoal">
                {room.sharingType}-Sharing
              </h4>
              <PriceBadge amount={room.monthlyRent} className="text-sm" />
            </div>

            <div className="flex flex-wrap gap-4">
              {roomBeds.map((bed) =>
                mode === "edit" ? (
                  <EditableBed
                    key={bed.id}
                    bed={bed}
                    onSetMaintenance={onSetMaintenance}
                    onAssignTenant={onAssignTenant}
                    onRemoveTenant={onRemoveTenant}
                  />
                ) : (
                  <button
                    key={bed.id}
                    type="button"
                    disabled={bed.status !== "available"}
                    onClick={() => onSelectBed?.(bed)}
                    className={`${bedTileClasses(bed.status)} transition-colors ${
                      bed.status === "available"
                        ? "cursor-pointer hover:border-gs-charcoal"
                        : "cursor-default"
                    } ${
                      selectedBedId === bed.id
                        ? "ring-2 ring-gs-charcoal ring-offset-2"
                        : ""
                    }`}
                    title={STATUS_LABEL[bed.status]}
                  >
                    <span>Bed {bed.position}</span>
                    <span className="opacity-70">{STATUS_LABEL[bed.status]}</span>
                  </button>
                )
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
