/**
 * Firebase: Provider Onboarding
 *
 * Turns the listing wizard's draft into the four documents the
 * marketplace actually reads: one property, N rooms, N×beds, and a
 * private verification record.
 */

import { db } from "./config";
import {
  collection,
  doc,
  writeBatch,
  serverTimestamp,
} from "firebase/firestore";
import type { GeoPoint, SharingType } from "./properties";

/** A room type the provider is offering, before it becomes documents. */
export interface DraftRoomType {
  /** Client-side id for list keying only; never written to Firestore. */
  localId: string;
  sharingType: SharingType;
  monthlyRent: number;
  /** How many rooms of this exact type/price the property has. */
  roomCount: number;
}

/**
 * Ownership / compliance details. Stored in `propertyVerifications`,
 * NOT on the public property doc.
 *
 * Deliberately captures document *references*, not uploaded scans:
 * Firebase Storage requires the Blaze plan, and the alternative —
 * asking owners to paste a public URL to a government ID — would push
 * people to host identity documents on public image hosts. Reference
 * numbers let a human reviewer verify against the issuing authority
 * without GridStay holding copies of ID images.
 */
export interface DraftVerification {
  ownerFullName: string;
  ownerPhone: string;
  /** Ownership evidence, e.g. property tax receipt or electricity bill. */
  ownershipDocType: string;
  ownershipDocNumber: string;
  /** Optional trade/municipal licence for running a PG or hostel. */
  tradeLicenceNumber: string;
}

export interface OnboardingDraft {
  name: string;
  description: string;
  address: string;
  city: string;
  campusNearby: string[];
  geopoint: GeoPoint | null;
  amenities: string[];
  coverImageUrl: string;
  photoUrls: string[];
  roomTypes: DraftRoomType[];
  verification: DraftVerification;
}

export type SubmitResult =
  | { success: true; propertyId: string }
  | { success: false; reason: "no-rooms" | "no-location" | "write-failed" };

/** Beds per room equals the sharing type: a 3-sharing room has 3 beds. */
export function totalBedsIn(roomTypes: DraftRoomType[]): number {
  return roomTypes.reduce(
    (sum, r) => sum + r.sharingType * r.roomCount,
    0
  );
}

/**
 * Create the whole listing in one atomic batch.
 *
 * A batch rather than sequential addDoc calls: creating a property,
 * then rooms, then beds one-at-a-time can fail partway and strand a
 * live property with no rooms or half its beds — visible in the
 * marketplace and impossible for the provider to clean up. A batch
 * either lands completely or not at all.
 *
 * Firestore caps a batch at 500 writes. Property + verification is 2,
 * so the room/bed budget is 498; `MAX_BEDS` keeps the wizard inside
 * that rather than failing opaquely at submit time.
 */
export const MAX_BEDS = 450;

export async function submitProviderOnboarding(
  providerId: string,
  draft: OnboardingDraft
): Promise<SubmitResult> {
  if (draft.roomTypes.length === 0) return { success: false, reason: "no-rooms" };
  if (!draft.geopoint) return { success: false, reason: "no-location" };

  const rents = draft.roomTypes.map((r) => r.monthlyRent);
  const sharingTypes = [...new Set(draft.roomTypes.map((r) => r.sharingType))];

  try {
    const batch = writeBatch(db);

    // Pre-generate the property ref so rooms/beds can carry its id
    // without waiting on a round-trip.
    const propertyRef = doc(collection(db, "properties"));

    batch.set(propertyRef, {
      name: draft.name,
      description: draft.description,
      address: draft.address,
      city: draft.city,
      campusNearby: draft.campusNearby,
      geopoint: draft.geopoint,
      providerId,
      // Rules force these three on create; a provider cannot
      // self-verify or seed their own rating.
      verified: false,
      ratingAvg: 0,
      ratingCount: 0,
      coverImageUrl: draft.coverImageUrl,
      photoUrls: draft.photoUrls,
      amenities: draft.amenities,
      priceRange: { min: Math.min(...rents), max: Math.max(...rents) },
      sharingTypes,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Private verification record, keyed by property id.
    batch.set(doc(db, "propertyVerifications", propertyRef.id), {
      propertyId: propertyRef.id,
      providerId,
      ...draft.verification,
      status: "pending",
      submittedAt: serverTimestamp(),
    });

    for (const roomType of draft.roomTypes) {
      for (let n = 0; n < roomType.roomCount; n++) {
        const roomRef = doc(collection(db, "rooms"));
        batch.set(roomRef, {
          propertyId: propertyRef.id,
          providerId,
          sharingType: roomType.sharingType,
          monthlyRent: roomType.monthlyRent,
          photoUrls: [],
        });

        for (let position = 1; position <= roomType.sharingType; position++) {
          batch.set(doc(collection(db, "beds")), {
            roomId: roomRef.id,
            propertyId: propertyRef.id,
            providerId,
            position,
            status: "available",
            monthlyRent: roomType.monthlyRent,
          });
        }
      }
    }

    // Flip the wizard gate so the provider isn't sent back through it.
    batch.update(doc(db, "users", providerId), {
      onboardingComplete: true,
    });

    await batch.commit();
    return { success: true, propertyId: propertyRef.id };
  } catch (err) {
    console.error("[GridStay] submitProviderOnboarding failed:", err);
    return { success: false, reason: "write-failed" };
  }
}
