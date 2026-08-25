/**
 * Firebase: Properties, Rooms & Reviews
 *
 * Typed CRUD + subscription functions over the `properties`, `rooms`,
 * and `reviews` collections. Each is its own top-level Firestore
 * collection (see beds.ts for the fourth tier, `beds`), grouped here
 * because a listing detail page loads all three alongside each other.
 */

import { db } from "./config";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  writeBatch,
  serverTimestamp,
} from "firebase/firestore";

export type SharingType = 1 | 2 | 3 | 4;

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface PriceRange {
  min: number;
  max: number;
}

export interface Property {
  id: string;
  name: string;
  description: string;
  address: string;
  geopoint: GeoPoint;
  city: string;
  campusNearby: string[];
  providerId: string;
  verified: boolean;
  coverImageUrl: string;
  photoUrls: string[];
  amenities: string[];
  priceRange: PriceRange;
  /** Denormalized from this property's rooms, same rationale as priceRange:
   *  lets the explore list/filter view match on sharing type without
   *  fanning out into the rooms collection per card. */
  sharingTypes: SharingType[];
  ratingAvg: number;
  ratingCount: number;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface Room {
  id: string;
  propertyId: string;
  /**
   * Denormalized owner id. Duplicated from the parent property so the
   * security rules can authorize a room write without a cross-document
   * lookup — the onboarding wizard creates a property and its rooms in
   * one batch, where the parent isn't committed yet. Optional because
   * rooms seeded before this field existed don't carry it.
   */
  providerId?: string;
  sharingType: SharingType;
  monthlyRent: number;
  photoUrls: string[];
}

export interface PropertyFilters {
  city?: string;
  sharingTypes?: SharingType[];
  amenities?: string[];
  priceMin?: number;
  priceMax?: number;
}

/**
 * Subscribe to verified properties, optionally scoped to a city.
 * Sharing-type / amenity / price filtering is applied client-side in
 * the caller (Explore page) since Firestore can't combine an
 * inequality range filter with array-contains-any on unrelated
 * fields in one query without a composite index per combination.
 */
export function subscribeToProperties(
  filters: Pick<PropertyFilters, "city">,
  callback: (properties: Property[]) => void,
  onError?: (error: Error) => void
): () => void {
  const constraints = [where("verified", "==", true)];
  if (filters.city) {
    constraints.push(where("city", "==", filters.city));
  }

  const propertiesQuery = query(collection(db, "properties"), ...constraints);

  return onSnapshot(
    propertiesQuery,
    (snapshot) => {
      const properties = snapshot.docs.map(
        (docSnap) => ({ id: docSnap.id, ...docSnap.data() }) as Property
      );
      callback(properties);
    },
    (error) => {
      console.error("[GridStay] subscribeToProperties failed:", error);
      onError?.(error);
    }
  );
}

/**
 * Live list of one provider's own properties.
 *
 * Separate from subscribeToProperties, which hard-filters
 * `verified == true` for the public marketplace — a provider must be
 * able to see their own listing while it's still awaiting review,
 * otherwise a freshly submitted property looks like it vanished.
 */
export function subscribeToProviderProperties(
  providerId: string,
  callback: (properties: Property[]) => void,
  onError?: (error: Error) => void
): () => void {
  const q = query(
    collection(db, "properties"),
    where("providerId", "==", providerId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      callback(
        snapshot.docs.map(
          (docSnap) => ({ id: docSnap.id, ...docSnap.data() }) as Property
        )
      );
    },
    (error) => {
      console.error("[GridStay] subscribeToProviderProperties failed:", error);
      onError?.(error);
    }
  );
}

/**
 * Fetch a single property by id (one-time read).
 */
export async function getProperty(propertyId: string): Promise<Property | null> {
  const snap = await getDoc(doc(db, "properties", propertyId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Property;
}

/**
 * Create a new property. Returns the new property's id.
 */
export async function createProperty(
  data: Omit<Property, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  const ref = await addDoc(collection(db, "properties"), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

/**
 * Update fields on an existing property.
 */
export async function updateProperty(
  propertyId: string,
  data: Partial<Omit<Property, "id" | "createdAt">>
): Promise<void> {
  await updateDoc(doc(db, "properties", propertyId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Change a room's rent, keeping every denormalized copy in sync.
 *
 * Rent is stored in three places by design — on the room, on each of
 * its beds (so a bed is self-describing in the booking flow), and
 * rolled up into the property's priceRange (so the explore grid can
 * filter without fanning out). Updating only the room would leave the
 * marketplace advertising a stale price and the booking flow charging
 * the old one, so all three move together in a single batch.
 *
 * `allRooms` is the property's full room list with this room's NEW
 * rent already applied; it's needed to recompute priceRange across
 * siblings.
 */
export async function updateRoomRent(
  propertyId: string,
  roomId: string,
  newRent: number,
  allRooms: Room[]
): Promise<void> {
  const batch = writeBatch(db);

  batch.update(doc(db, "rooms", roomId), { monthlyRent: newRent });

  const bedsSnap = await getDocs(
    query(collection(db, "beds"), where("roomId", "==", roomId))
  );
  bedsSnap.docs.forEach((bed) =>
    batch.update(bed.ref, { monthlyRent: newRent })
  );

  const rents = allRooms.map((r) => r.monthlyRent);
  batch.update(doc(db, "properties", propertyId), {
    priceRange: { min: Math.min(...rents), max: Math.max(...rents) },
    updatedAt: serverTimestamp(),
  });

  await batch.commit();
}

/**
 * Fetch all rooms for a property (one-time read — room configuration
 * changes rarely enough that a live listener isn't needed here;
 * live availability is handled per-bed by beds.ts).
 */
export async function getRoomsByProperty(propertyId: string): Promise<Room[]> {
  const roomsQuery = query(
    collection(db, "rooms"),
    where("propertyId", "==", propertyId)
  );
  const snapshot = await getDocs(roomsQuery);
  return snapshot.docs.map(
    (docSnap) => ({ id: docSnap.id, ...docSnap.data() }) as Room
  );
}

/**
 * Create a room under a property.
 */
export async function createRoom(
  data: Omit<Room, "id">
): Promise<string> {
  const ref = await addDoc(collection(db, "rooms"), data);
  return ref.id;
}

export interface Review {
  id: string;
  propertyId: string;
  studentId: string;
  rating: number;
  comment: string;
  createdAt?: unknown;
}

/**
 * Fetch reviews for a property, newest first (one-time read).
 */
export async function getReviewsByProperty(
  propertyId: string
): Promise<Review[]> {
  const reviewsQuery = query(
    collection(db, "reviews"),
    where("propertyId", "==", propertyId),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(reviewsQuery);
  return snapshot.docs.map(
    (docSnap) => ({ id: docSnap.id, ...docSnap.data() }) as Review
  );
}
