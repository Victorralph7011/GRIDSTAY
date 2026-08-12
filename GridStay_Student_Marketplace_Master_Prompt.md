# GridStay — Student Marketplace Build Prompt (Phase 2: "Airbnb/OYO for Hostels")

Paste this whole document as your instruction for the next build phase. It assumes the auth flow (login/signup, glass theme, Turbopack/scroll fixes) is already done — this phase is the actual product: students discovering and booking beds.

---

## 1. Role

Act as a senior product engineer who is simultaneously a UI/UX designer and a backend engineer. Design the information architecture and data model before writing UI. Reuse GridStay's existing design system (`globals.css`, `EchoStackLogo`, the `.glass-*` and `.auth-bg` classes) — do not invent a second visual language. Build in vertical slices (schema → list view → detail view → booking flow), verifying each slice runs before starting the next.

## 2. What We're Building

The **Student Marketplace**: a discovery-and-booking experience modeled on Airbnb's browsing pattern and OYO's inventory/pricing pattern, skinned entirely in GridStay's monochrome-glass aesthetic (not Airbnb's colorful branding, not OYO's red — Clash Display headers, Satoshi body, black/white/grey palette, glassmorphic cards, Echo Stack branding).

Core loop: student opens `/explore` → sees a map + list of verified hostels/PGs near a campus → filters by price, sharing type (1/2/3/4-bed), amenities → opens a listing → sees photo gallery, room/bed options with live availability, price per bed, reviews, amenities → selects a bed → signs a digital rental agreement (Aadhaar eSign) → booking confirmed and the bed disappears from search in real time for every other student (Firestore `onSnapshot`).

## 3. Current State (read before building)

- `src/app/(student)/explore/page.tsx` is a stub — one `<h1>`, no listings, no map. It also references CSS classes (`bg-gs-bg`, `text-gs-text`) that **do not exist** in the current `globals.css` theme tokens (`--color-gs-white`, `--color-gs-offwhite`, `--color-gs-charcoal`, etc.) — this page currently renders unstyled. Fix the class names as part of this build, don't just add content on top of broken classes.
- `src/lib/firebase/beds.ts` is a scaffold: `BedStatus`/`Bed` types are defined, but `subscribeToBeds` and `updateBedStatus` are empty stubs with `console.log` placeholders and commented-out Firestore imports. This is the real-time engine for "bed disappears from search instantly" — it needs to be implemented, not just typed.
- `src/lib/esign/contracts.ts` and `src/lib/razorpay/payments.ts` exist but weren't inspected in this pass — check their current state before assuming they're implemented or stubs.
- `src/components/ui/glass/GlassCard.tsx` and `GlassButton.tsx` reference a **different, unused color system** (`bg-neon-lime`, `text-gs-bg`, a `.glass` utility class) that isn't defined anywhere in the current `globals.css`. These are dead code from an earlier design direction — either delete them or rewrite them to use the real theme tokens before reusing them; don't build new components on top of broken ones.
- `src/lib/firebase/config.ts` and `useAuth.ts` are solid and complete — reuse as-is.

## 4. Information Architecture

```
(student)/
  explore/page.tsx           — map + list discovery view (main entry point)
  listing/[id]/page.tsx      — single property detail + booking widget
  booking/[id]/page.tsx      — eSign + payment confirmation flow
  bookings/page.tsx          — "my bookings" / rental history
  profile/page.tsx           — student profile, Aadhaar status

(provider)/
  dashboard/page.tsx         — overview: occupancy %, revenue, pending tickets (exists, stub)
  properties/page.tsx        — list of owned properties
  properties/[id]/page.tsx   — bed-level inventory grid (the core "SaaS OS" screen)
  properties/[id]/edit/page.tsx — pricing, amenities, photos
  tenants/page.tsx           — active tenants, rent status
  maintenance/page.tsx       — maintenance ticket queue
```

## 5. Data Model (Firestore)

Design these collections before writing any UI — the UI is a thin layer over this:

```
properties/{propertyId}
  name, description, address, geopoint (lat/lng), city, campusNearby[]
  providerId, verified: boolean, coverImageUrl, photoUrls[]
  amenities: string[]  (wifi, laundry, mess, ac, power-backup, security, ...)
  priceRange: { min, max }  (denormalized for fast list-view filtering)
  ratingAvg, ratingCount
  createdAt, updatedAt

rooms/{roomId}
  propertyId, sharingType: 1 | 2 | 3 | 4
  monthlyRent, photoUrls[]

beds/{bedId}                 — matches existing Bed type in beds.ts
  roomId, propertyId, position, status: "available"|"occupied"|"maintenance"
  tenantId?, monthlyRent

bookings/{bookingId}
  studentId, propertyId, roomId, bedId
  status: "pending_esign" | "pending_payment" | "confirmed" | "cancelled"
  contractId, paymentId, moveInDate, createdAt

reviews/{reviewId}
  propertyId, studentId, rating, comment, createdAt

users/{uid}                  — already exists via useAuth.ts, extend with:
  savedListings: string[], aadhaarVerified: boolean
```

Denormalize `priceRange` and `ratingAvg` onto `properties` so the explore-page list/filter view never has to fan out into `rooms`/`reviews` per card — that's the pattern that keeps an Airbnb-style grid fast.

## 6. Component Inventory (all styled with existing GridStay tokens — Clash Display / Satoshi / gs-* colors / `.glass-card`)

- `ListingCard` — photo, name, campus distance, price-from badge, rating, verified badge (reuse the existing `.animate-pulse-dot` verified-badge animation already defined in `globals.css`)
- `ExploreFilterBar` — sticky top bar: price range slider, sharing-type pills (1/2/3/4), amenities multi-select, search-by-campus input
- `ExploreMapView` — map with pins, syncs hover/selection with the list (this is the single most "Airbnb" interaction — building it well matters more than any other single component)
- `PriceBadge` — consistent price formatting (₹X,XXX/mo) used on cards, listing page, and booking widget
- `BedAvailabilityGrid` — visual grid of beds per room (available/occupied/maintenance), reused verbatim between the student booking view (read-only + "select") and the provider inventory view (editable)
- `BookingWidget` — sticky sidebar on listing detail: room/sharing selector, date picker, price breakdown, "Reserve Bed" CTA
- `PhotoGallery` — lightbox gallery for property photos
- `ReviewList` / `ReviewCard`

## 7. Step-by-Step Build Order

**Phase 0 — Fix the foundation**
Delete or rewrite `GlassCard`/`GlassButton` to use real theme tokens. Fix `explore/page.tsx`'s broken class names. Confirm `beds.ts`'s types match the Firestore schema in Section 5.

**Phase 1 — Data layer**
Implement `subscribeToBeds` and `updateBedStatus` in `beds.ts` with real `onSnapshot`/`updateDoc` calls (the commented-out imports are already there — uncomment and wire them). Add equivalent `lib/firebase/properties.ts` and `lib/firebase/bookings.ts` with typed CRUD + subscription functions, following the same pattern as `useAuth.ts` (typed interfaces, callback-based hooks, error mapping).

**Phase 2 — Explore page (list only, no map yet)**
Build `ListingCard` and `ExploreFilterBar`. Wire `/explore` to a live Firestore query over `properties`, client-side filtered by the filter bar state. Ship this before touching the map — a working list is more valuable than a half-working map.

**Phase 3 — Map view**
Add `ExploreMapView`, sync selection state with the list (hovering a card highlights its pin and vice versa). Use a lightweight map library (evaluate Mapbox GL JS or Google Maps JS API against your existing API key situation — check `.env.local` for which keys already exist before picking one).

**Phase 4 — Listing detail page**
Build `/listing/[id]`: `PhotoGallery`, amenities list, `BedAvailabilityGrid` (read-only), `ReviewList`, and the sticky `BookingWidget`. Real-time: if a bed's status flips to "occupied" while a student is viewing the page, the grid should update live via the `subscribeToBeds` listener from Phase 1.

**Phase 5 — Booking + eSign flow**
Wire `BookingWidget`'s "Reserve Bed" through to `/booking/[id]`: check `lib/esign/contracts.ts`'s current state, implement the Aadhaar eSign step, then the Razorpay payment step (`lib/razorpay/payments.ts`), then flip the bed's Firestore status to "occupied" and create the `bookings/{id}` document atomically (use a Firestore transaction so two students can't book the same bed in a race condition — this is the most important correctness bug to prevent in the whole app).

**Phase 6 — Provider inventory management**
Build `properties/[id]/page.tsx` using the same `BedAvailabilityGrid` component from Phase 4, but editable — provider can manually toggle a bed to "maintenance" or manually assign/remove a tenant.

**Phase 7 — Polish pass**
Run through every new page checking: Clash Display used only on headings, Satoshi everywhere else, glass-card/blur consistency with the auth pages, mobile responsiveness (map view especially needs a mobile list/map toggle pattern like Airbnb's), loading skeletons instead of blank flashes, empty states ("No hostels found near this campus yet").

## 8. Design Constraints

- Every new page must feel like it belongs next to `/auth/login` — same fonts, same glass card treatment where a card is used, same monochrome palette. No new colors without checking `globals.css`'s `@theme inline` block first.
- Reuse `EchoStackLogo` for any branding moment (empty states, loading screens) instead of plain text "GridStay."
- Follow the OYO pattern for price display (price-per-bed, not price-per-room, since GridStay's core mechanic is bed-level inventory — this is a meaningful product difference from Airbnb, keep it explicit in every price label).
- Follow the Airbnb pattern for the list/map split view and photo gallery interaction — these are proven UX patterns worth copying structurally, just not visually.

## 9. Verification Checklist (per phase, not just at the end)

- `npm run lint` and `npx tsc --noEmit` clean after each phase.
- Manually create 2-3 seed `properties`/`rooms`/`beds` documents in Firestore (or a seed script) to test against real data, not empty states only.
- Open two browser windows, book the same bed simultaneously in both, confirm only one booking succeeds (tests the Phase 5 transaction).
- Check the console on every new page for hydration warnings and Firebase permission errors (Firestore security rules will need read rules for `properties`/`rooms`/`beds` and write rules scoped to `providerId`/`studentId` — write these rules explicitly, don't leave the database in test-mode open rules).
