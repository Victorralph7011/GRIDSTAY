/**
 * Firebase: Real-Time Bed Vacancy Listeners
 *
 * Provides real-time Firestore listeners for bed-level
 * inventory status across properties. Used by both the
 * Provider dashboard (for management) and Student marketplace
 * (for live availability).
 *
 * Bed Status Enum:
 *   "available" | "occupied" | "maintenance"
 */

import { db } from "./config";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
} from "firebase/firestore";

export type BedStatus = "available" | "occupied" | "maintenance";

export interface Bed {
  id: string;
  roomId: string;
  propertyId: string;
  /** Denormalized owner id — see the note on Room.providerId. */
  providerId?: string;
  position: number; // Bed number in room (1-4)
  status: BedStatus;
  tenantId?: string;
  monthlyRent: number;
}

/**
 * Subscribe to real-time bed updates for a property.
 * Returns an unsubscribe function.
 */
export function subscribeToBeds(
  propertyId: string,
  callback: (beds: Bed[]) => void,
  onError?: (error: Error) => void
): () => void {
  const bedsQuery = query(
    collection(db, "beds"),
    where("propertyId", "==", propertyId)
  );

  return onSnapshot(
    bedsQuery,
    (snapshot) => {
      const beds = snapshot.docs.map(
        (docSnap) => ({ id: docSnap.id, ...docSnap.data() }) as Bed
      );
      callback(beds);
    },
    (error) => {
      console.error("[GridStay] subscribeToBeds failed:", error);
      onError?.(error);
    }
  );
}

/**
 * Update a single bed's status.
 */
export async function updateBedStatus(
  bedId: string,
  status: BedStatus,
  tenantId?: string
): Promise<void> {
  await updateDoc(doc(db, "beds", bedId), {
    status,
    tenantId: tenantId ?? null,
  });
}
