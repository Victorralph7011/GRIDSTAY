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

// import { db } from "./config";
// import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";

export type BedStatus = "available" | "occupied" | "maintenance";

export interface Bed {
  id: string;
  roomId: string;
  propertyId: string;
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
  callback: (beds: Bed[]) => void
): () => void {
  // TODO: Implement with Firestore onSnapshot
  console.log(`[GridStay] Subscribing to beds for property: ${propertyId}`);
  return () => {
    console.log(`[GridStay] Unsubscribed from property: ${propertyId}`);
  };
}

/**
 * Update a single bed's status.
 */
export async function updateBedStatus(
  propertyId: string,
  bedId: string,
  status: BedStatus
): Promise<void> {
  // TODO: Implement with Firestore updateDoc
  console.log(`[GridStay] Updating bed ${bedId} to ${status}`);
}
