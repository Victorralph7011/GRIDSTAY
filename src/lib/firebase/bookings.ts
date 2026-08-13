/**
 * Firebase: Bookings
 *
 * Typed CRUD + subscription functions over the `bookings` collection,
 * plus the atomic booking-confirmation transaction that must prevent
 * two students from ending up with the same bed.
 */

import { db } from "./config";
import {
  collection,
  doc,
  onSnapshot,
  getDoc,
  addDoc,
  updateDoc,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";
import type { Bed } from "./beds";

export type BookingStatus =
  | "pending_esign"
  | "pending_payment"
  | "confirmed"
  | "cancelled";

export interface Booking {
  id: string;
  studentId: string;
  propertyId: string;
  roomId: string;
  bedId: string;
  status: BookingStatus;
  contractId?: string;
  paymentId?: string;
  moveInDate: string;
  createdAt?: unknown;
}

/**
 * Create a new booking in "pending_esign" state. This does not claim
 * the bed — the bed stays "available" to other students until the
 * Phase 5 confirmation transaction runs, so this is safe to call
 * optimistically as soon as a student picks a bed.
 */
export async function createPendingBooking(data: {
  studentId: string;
  propertyId: string;
  roomId: string;
  bedId: string;
  moveInDate: string;
}): Promise<string> {
  const ref = await addDoc(collection(db, "bookings"), {
    ...data,
    status: "pending_esign" as BookingStatus,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

/**
 * Fetch a single booking by id (one-time read).
 */
export async function getBooking(bookingId: string): Promise<Booking | null> {
  const snap = await getDoc(doc(db, "bookings", bookingId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Booking;
}

/**
 * Subscribe to live status updates for a single booking — used on the
 * /booking/[id] confirmation page to reflect eSign/payment progress.
 */
export function subscribeToBooking(
  bookingId: string,
  callback: (booking: Booking | null) => void,
  onError?: (error: Error) => void
): () => void {
  return onSnapshot(
    doc(db, "bookings", bookingId),
    (snap) => {
      callback(snap.exists() ? ({ id: snap.id, ...snap.data() } as Booking) : null);
    },
    (error) => {
      console.error("[GridStay] subscribeToBooking failed:", error);
      onError?.(error);
    }
  );
}

/**
 * Update a booking's status and/or attach contract/payment ids as the
 * student progresses through eSign and payment.
 */
export async function updateBooking(
  bookingId: string,
  data: Partial<Pick<Booking, "status" | "contractId" | "paymentId">>
): Promise<void> {
  await updateDoc(doc(db, "bookings", bookingId), data);
}

export type ConfirmBookingResult =
  | { success: true }
  | { success: false; reason: "booking-not-found" | "bed-not-found" | "bed-unavailable" | "already-confirmed" };

/**
 * Atomically claim the booking's bed and mark the booking confirmed.
 *
 * This is the one operation in the whole app that must not race: if
 * two students reach this point for the same bed, exactly one of the
 * two calls must succeed. It works because Firestore transactions use
 * optimistic concurrency — both calls read the bed's current status
 * inside the transaction, but only the first to commit actually wins;
 * Firestore detects that the second transaction's read is now stale
 * (the bed doc changed between its read and its commit attempt) and
 * automatically retries it, so the retry sees status "occupied" and
 * this function returns "bed-unavailable" for the loser instead of
 * silently double-booking the bed.
 *
 * Client-side checks here (booking ownership, status) are for fast,
 * friendly error messages only — they are not a security boundary.
 * The actual enforcement is the Firestore security rules (Phase 7).
 */
export async function confirmBooking(
  bookingId: string,
  studentId: string,
  contractId: string,
  paymentId: string
): Promise<ConfirmBookingResult> {
  try {
    await runTransaction(db, async (tx) => {
      const bookingRef = doc(db, "bookings", bookingId);
      const bookingSnap = await tx.get(bookingRef);
      if (!bookingSnap.exists()) {
        throw new Error("booking-not-found");
      }
      const booking = bookingSnap.data() as Booking;

      if (booking.status === "confirmed") {
        throw new Error("already-confirmed");
      }
      if (booking.studentId !== studentId) {
        throw new Error("booking-not-found");
      }

      const bedRef = doc(db, "beds", booking.bedId);
      const bedSnap = await tx.get(bedRef);
      if (!bedSnap.exists()) {
        throw new Error("bed-not-found");
      }
      const bed = bedSnap.data() as Bed;

      if (bed.status !== "available") {
        throw new Error("bed-unavailable");
      }

      tx.update(bedRef, { status: "occupied", tenantId: studentId });
      tx.update(bookingRef, {
        status: "confirmed",
        contractId,
        paymentId,
      });
    });

    return { success: true };
  } catch (err) {
    const reason = err instanceof Error ? err.message : "";
    if (
      reason === "booking-not-found" ||
      reason === "bed-not-found" ||
      reason === "bed-unavailable" ||
      reason === "already-confirmed"
    ) {
      return { success: false, reason };
    }
    throw err;
  }
}
