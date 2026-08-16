/**
 * Firestore seed script — GridStay
 *
 * Populates `properties`, `rooms`, `beds`, and `reviews` with a
 * realistic set of Indian student-housing listings.
 *
 * Deliberately uses the *client* SDK signed in as a real provider
 * account rather than firebase-admin: admin bypasses security rules
 * entirely, so seeding through the normal auth path doubles as a live
 * test that the deployed rules actually permit the app's own writes.
 *
 * Run:  node scripts/seed.mjs
 * Env:  reads .env.local (same NEXT_PUBLIC_FIREBASE_* vars as the app)
 */

import { readFileSync } from "node:fs";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

/* ── Config from .env.local ── */
const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n")
    .filter((l) => l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"|"$/g, "")];
    })
);

const app = initializeApp({
  apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.NEXT_PUBLIC_FIREBASE_APP_ID,
});

const auth = getAuth(app);
const db = getFirestore(app);

/**
 * Passwords come from .env.local (gitignored) rather than living in
 * this file — the repo is public, and these accounts own every seeded
 * listing, so a committed password would let anyone edit or delete
 * them.
 */
for (const key of ["SEED_PROVIDER_PASSWORD", "SEED_STUDENT_PASSWORD"]) {
  if (!env[key]) {
    console.error(
      `Missing ${key} in .env.local.\n` +
        `Add both SEED_PROVIDER_PASSWORD and SEED_STUDENT_PASSWORD ` +
        `(any strong strings, 6+ chars) and re-run.`
    );
    process.exit(1);
  }
}

const SEED_ACCOUNTS = {
  provider: {
    email: "seed.provider@gridstay.dev",
    password: env.SEED_PROVIDER_PASSWORD,
  },
  student: {
    email: "seed.student@gridstay.dev",
    password: env.SEED_STUDENT_PASSWORD,
  },
};

/** Switch the active session to a seed account. */
const signIn = ({ email, password }) =>
  signInWithEmailAndPassword(auth, email, password);

/** Sign in, creating the account (and its users/{uid} profile) if new. */
async function ensureAccount({ email, password }, role, displayName) {
  let cred;
  try {
    cred = await signInWithEmailAndPassword(auth, email, password);
  } catch {
    cred = await createUserWithEmailAndPassword(auth, email, password);
  }
  await setDoc(
    doc(db, "users", cred.user.uid),
    {
      email,
      role,
      displayName,
      // The seed provider already owns fully-formed listings, so it
      // must not be bounced into the onboarding wizard on login.
      ...(role === "provider" ? { onboardingComplete: true } : {}),
      createdAt: serverTimestamp(),
    },
    { merge: true }
  );
  return cred.user.uid;
}

/* ── Listing data ── */
const LISTINGS = [
  {
    name: "Anand Niketan Residency",
    description:
      "A purpose-built coaching hostel two minutes from Allen's main campus. Individual study desks with dedicated lamps in every room, a silent-floor policy after 10pm, and a mess that runs on a rotating North Indian menu. Power backup covers the full building, so late-night revision is never interrupted.",
    address: "Plot 14, Road No. 1, Talwandi, Kota, Rajasthan 324005",
    city: "Kota",
    campusNearby: ["Allen Career Institute", "Resonance Kota"],
    geopoint: { lat: 25.1638, lng: 75.8648 },
    coverImageUrl: "/shared_dorm.png",
    photoUrls: ["/shared_dorm.png", "/hero_lounge.png", "/premium_single_room.png", "/coliving_space.png"],
    amenities: ["wifi", "mess", "laundry", "power-backup", "security"],
    ratingAvg: 4.6,
    ratingCount: 128,
    rooms: [
      { sharingType: 1, monthlyRent: 16500, beds: 2 },
      { sharingType: 2, monthlyRent: 11000, beds: 4 },
      { sharingType: 3, monthlyRent: 8500, beds: 6 },
    ],
    reviews: [
      { rating: 5, comment: "The silent floor after 10pm is the reason I could actually finish my revision cycles. Mess food is genuinely good too." },
      { rating: 4, comment: "Power backup never failed once in eight months. Rooms are a little tight for 3-sharing but the study desks are solid." },
    ],
  },
  {
    name: "Skyline Co-Living",
    description:
      "Modern co-living a short walk from Christ University, built around large shared lounges rather than cramped corridors. Rooms come with smart locks and individual lockers. The rooftop common area gets used for everything from group study to Sunday breakfast.",
    address: "42 Hosur Main Road, Koramangala, Bengaluru, Karnataka 560095",
    city: "Bengaluru",
    campusNearby: ["Christ University", "St. Joseph's College"],
    geopoint: { lat: 12.9345, lng: 77.6069 },
    coverImageUrl: "/coliving_space.png",
    photoUrls: ["/coliving_space.png", "/hero_lounge.png", "/premium_single_room.png", "/shared_dorm.png"],
    amenities: ["wifi", "ac", "laundry", "security", "power-backup", "mess"],
    ratingAvg: 4.8,
    ratingCount: 94,
    rooms: [
      { sharingType: 1, monthlyRent: 22000, beds: 3 },
      { sharingType: 2, monthlyRent: 15000, beds: 4 },
    ],
    reviews: [
      { rating: 5, comment: "Easily the cleanest place I've stayed in Bengaluru. The rooftop lounge is what sold me — it actually gets used." },
      { rating: 5, comment: "Smart locks and proper security at the gate. As a first-year living away from home, my parents stopped worrying after one visit." },
    ],
  },
  {
    name: "The Study Hub PG",
    description:
      "A quiet, family-run PG in Shivajinagar catering mainly to engineering students. Home-style vegetarian meals included, with a dedicated reading room on the ground floor. Walking distance to COEP's main gate.",
    address: "Lane 5, Shivajinagar, Pune, Maharashtra 411005",
    city: "Pune",
    campusNearby: ["COEP Technological University", "Fergusson College"],
    geopoint: { lat: 18.5308, lng: 73.8475 },
    coverImageUrl: "/premium_single_room.png",
    photoUrls: ["/premium_single_room.png", "/shared_dorm.png", "/hero_lounge.png"],
    amenities: ["wifi", "mess", "laundry", "security"],
    ratingAvg: 4.3,
    ratingCount: 61,
    rooms: [
      { sharingType: 2, monthlyRent: 9500, beds: 4 },
      { sharingType: 4, monthlyRent: 6500, beds: 8 },
    ],
    reviews: [
      { rating: 4, comment: "Food tastes like home, which matters more than you'd think by month three. Reading room is a nice touch." },
      { rating: 4, comment: "Great value for the location. No AC, but Pune winters make that a non-issue for half the year." },
    ],
  },
  {
    name: "Urban Nest Hostel",
    description:
      "Built for the Gachibowli tech-campus crowd, with high-speed symmetric fibre on every floor and 24/7 access since a lot of residents keep irregular hours. Fully air-conditioned, with a small gym and a cafe on the ground floor.",
    address: "Survey No. 91, Gachibowli, Hyderabad, Telangana 500032",
    city: "Hyderabad",
    campusNearby: ["IIIT Hyderabad", "University of Hyderabad"],
    geopoint: { lat: 17.4435, lng: 78.3479 },
    coverImageUrl: "/hero_lounge.png",
    photoUrls: ["/hero_lounge.png", "/coliving_space.png", "/premium_single_room.png", "/shared_dorm.png"],
    amenities: ["wifi", "ac", "power-backup", "security", "laundry"],
    ratingAvg: 4.7,
    ratingCount: 143,
    rooms: [
      { sharingType: 1, monthlyRent: 19500, beds: 4 },
      { sharingType: 2, monthlyRent: 13500, beds: 6 },
      { sharingType: 3, monthlyRent: 10000, beds: 3 },
    ],
    reviews: [
      { rating: 5, comment: "The internet is genuinely symmetric gigabit — I've pushed builds at 3am with zero issues." },
      { rating: 5, comment: "24/7 access without signing a register every time is underrated. Cafe downstairs saves me on late nights." },
    ],
  },
  {
    name: "Greenwood Student Living",
    description:
      "A converted heritage bungalow near DU North Campus with high ceilings and a shaded courtyard. Rooms are simple but generously sized, and the location puts Kamla Nagar's markets within a five-minute walk.",
    address: "27 Chhatra Marg, North Campus, Delhi 110007",
    city: "Delhi",
    campusNearby: ["University of Delhi (North Campus)", "Hindu College"],
    geopoint: { lat: 28.6899, lng: 77.2119 },
    coverImageUrl: "/shared_dorm.png",
    photoUrls: ["/shared_dorm.png", "/hero_lounge.png", "/premium_single_room.png"],
    amenities: ["wifi", "mess", "security", "power-backup"],
    ratingAvg: 4.2,
    ratingCount: 78,
    rooms: [
      { sharingType: 2, monthlyRent: 12500, beds: 4 },
      { sharingType: 3, monthlyRent: 9000, beds: 6 },
      { sharingType: 4, monthlyRent: 7000, beds: 4 },
    ],
    reviews: [
      { rating: 4, comment: "The courtyard is lovely in winter. Old building so plumbing occasionally complains, but it gets fixed fast." },
      { rating: 5, comment: "Five minutes from Kamla Nagar and ten from the faculty. Location alone is worth it." },
    ],
  },
  {
    name: "Coastal Co-Live Chennai",
    description:
      "Fifteen minutes from Anna University's Guindy campus, with sea breeze on the upper floors and an unusually generous common kitchen. Popular with postgraduate students who cook for themselves.",
    address: "18 Sardar Patel Road, Guindy, Chennai, Tamil Nadu 600025",
    city: "Chennai",
    campusNearby: ["Anna University", "IIT Madras"],
    geopoint: { lat: 13.0067, lng: 80.2206 },
    coverImageUrl: "/coliving_space.png",
    photoUrls: ["/coliving_space.png", "/premium_single_room.png", "/hero_lounge.png"],
    amenities: ["wifi", "ac", "laundry", "security"],
    ratingAvg: 4.4,
    ratingCount: 52,
    rooms: [
      { sharingType: 1, monthlyRent: 17000, beds: 2 },
      { sharingType: 2, monthlyRent: 11500, beds: 6 },
    ],
    reviews: [
      { rating: 4, comment: "The shared kitchen is the best I've seen in a PG — actual counter space and a working oven." },
      { rating: 5, comment: "Upper-floor rooms get real sea breeze. Made Chennai summers survivable." },
    ],
  },
];

/**
 * Remove everything this seed provider previously created. Scoped by
 * providerId so it can never touch real listings, and it runs through
 * the same rules as the app — the provider owns these docs, so the
 * deletes are permitted without admin privileges.
 */
async function resetSeed(providerId, studentId) {
  // Ownership is per-account, so each half of the cleanup has to run as
  // the account that owns those docs.
  await signIn(SEED_ACCOUNTS.provider);

  const props = await getDocs(
    query(collection(db, "properties"), where("providerId", "==", providerId))
  );

  for (const p of props.docs) {
    for (const name of ["beds", "rooms"]) {
      const children = await getDocs(
        query(collection(db, name), where("propertyId", "==", p.id))
      );
      await Promise.all(children.docs.map((c) => deleteDoc(c.ref)));
    }
    await deleteDoc(p.ref);
  }

  await signIn(SEED_ACCOUNTS.student);
  const reviews = await getDocs(
    query(collection(db, "reviews"), where("studentId", "==", studentId))
  );
  await Promise.all(reviews.docs.map((r) => deleteDoc(r.ref)));

  console.log(`  removed ${props.size} properties and their rooms/beds/reviews`);
}

/* ── Seed ── */
async function main() {
  const reset = process.argv.includes("--reset");

  console.log("Signing in seed accounts…");
  const providerId = await ensureAccount(SEED_ACCOUNTS.provider, "provider", "GridStay Seed Properties");
  const studentId = await ensureAccount(SEED_ACCOUNTS.student, "student", "Seed Student");
  console.log(`  provider uid: ${providerId}`);

  if (reset) {
    console.log("Resetting previous seed data…");
    await resetSeed(providerId, studentId);
  }

  // Listings are written as the provider.
  await signIn(SEED_ACCOUNTS.provider);

  const existing = await getDocs(
    query(collection(db, "properties"), where("providerId", "==", providerId))
  );
  if (!existing.empty) {
    console.log(
      `\n${existing.size} seeded properties already exist. Re-run with --reset to replace them.`
    );
    process.exit(0);
  }

  let totalRooms = 0;
  let totalBeds = 0;

  for (const listing of LISTINGS) {
    // `reviews` is written in a separate pass below, as the student.
    const { rooms, reviews: _reviews, ...propertyFields } = listing;
    const rents = rooms.map((r) => r.monthlyRent);

    const propertyRef = await addDoc(collection(db, "properties"), {
      ...propertyFields,
      providerId,
      // Rules force verified:false on create and freeze it on update —
      // self-verification would defeat the marketplace's trust model,
      // so this is deliberately not settable from a normal client
      // write. See the printed instructions at the end of this script.
      verified: false,
      priceRange: { min: Math.min(...rents), max: Math.max(...rents) },
      sharingTypes: [...new Set(rooms.map((r) => r.sharingType))],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    for (const room of rooms) {
      const roomRef = await addDoc(collection(db, "rooms"), {
        propertyId: propertyRef.id,
        sharingType: room.sharingType,
        monthlyRent: room.monthlyRent,
        photoUrls: propertyFields.photoUrls.slice(0, 2),
      });
      totalRooms++;

      for (let position = 1; position <= room.beds; position++) {
        // Leave a deterministic slice occupied/under maintenance so the
        // availability grid isn't a uniform wall of green in demos.
        const status =
          position === 1 && room.sharingType > 1
            ? "occupied"
            : position === room.beds && room.beds > 4
              ? "maintenance"
              : "available";

        await addDoc(collection(db, "beds"), {
          roomId: roomRef.id,
          propertyId: propertyRef.id,
          position,
          status,
          monthlyRent: room.monthlyRent,
          ...(status === "occupied" ? { tenantId: "seed-tenant-placeholder" } : {}),
        });
        totalBeds++;
      }
    }

    console.log(`  + ${listing.name} (${rooms.length} rooms)`);
    listing.__id = propertyRef.id;
  }

  console.log("\nSigning in as seed student for reviews…");
  await signIn(SEED_ACCOUNTS.student);

  let totalReviews = 0;
  for (const listing of LISTINGS) {
    for (const review of listing.reviews) {
      await addDoc(collection(db, "reviews"), {
        propertyId: listing.__id,
        studentId,
        rating: review.rating,
        comment: review.comment,
        createdAt: serverTimestamp(),
      });
      totalReviews++;
    }
  }

  console.log(
    `\nDone. ${LISTINGS.length} properties, ${totalRooms} rooms, ${totalBeds} beds, ${totalReviews} reviews.`
  );
  console.log(
    "\nThese are seeded as verified:false (the rules no longer allow a\n" +
      "provider to self-verify). To make them show up on /explore, flip\n" +
      "`verified` to true by hand in the Firebase Console → Firestore →\n" +
      "properties, or ask me to build an admin-SDK verification script if\n" +
      "you'll be doing this often:\n" +
      LISTINGS.map((l) => `  - ${l.name}: ${l.__id}`).join("\n")
  );
  process.exit(0);
}

main().catch((err) => {
  console.error("\nSeed failed:", err?.code || "", err?.message || err);
  process.exit(1);
});
