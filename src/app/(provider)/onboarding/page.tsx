"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Check } from "lucide-react";
import { useAuth } from "@/lib/firebase/useAuth";
import {
  submitProviderOnboarding,
  totalBedsIn,
  MAX_BEDS,
  type OnboardingDraft,
  type DraftRoomType,
} from "@/lib/firebase/onboarding";
import type { SharingType } from "@/lib/firebase/properties";
import { AMENITY_OPTIONS } from "@/components/marketplace/amenities";
import MarketplaceHeader from "@/components/marketplace/MarketplaceHeader";

// Leaflet reads `window` at module scope — never server-render it.
const LocationPicker = dynamic(
  () => import("@/components/marketplace/LocationPicker"),
  { ssr: false, loading: () => <div className="w-full h-full bg-gs-offwhite animate-pulse" /> }
);

const DRAFT_KEY = "gridstay:onboarding-draft";

const EMPTY_DRAFT: OnboardingDraft = {
  name: "",
  description: "",
  address: "",
  city: "",
  campusNearby: [],
  geopoint: null,
  amenities: [],
  coverImageUrl: "",
  photoUrls: [],
  roomTypes: [],
  verification: {
    ownerFullName: "",
    ownerPhone: "",
    ownershipDocType: "Property tax receipt",
    ownershipDocNumber: "",
    tradeLicenceNumber: "",
  },
};

const STEPS = ["Property", "Location", "Rooms & Pricing", "Photos", "Verification"];

const OWNERSHIP_DOC_TYPES = [
  "Property tax receipt",
  "Electricity bill",
  "Registered sale deed",
  "Rent agreement (if leased)",
];

const inputClass =
  "w-full rounded-xl border border-gs-lightgrey bg-gs-white px-4 py-3 text-[15px] text-gs-charcoal placeholder:text-gs-midgrey focus:outline-none focus:border-gs-charcoal transition-colors";
const labelClass =
  "text-[11px] font-bold tracking-[0.1em] uppercase text-gs-midgrey";

export default function ProviderOnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [step, setStep] = useState(0);
  const [campusInput, setCampusInput] = useState("");
  const [photoInput, setPhotoInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  /* ── Draft persistence ──
     localStorage rather than a Firestore draft doc: this form is long
     enough that losing it to an accidental refresh is the real risk,
     and localStorage solves that with no extra collection, rules, or
     cleanup story. Cross-device resume isn't worth that complexity
     yet.

     Restored via lazy useState initialisation rather than an effect —
     reading it in an effect and calling setDraft would render the
     empty form first and then immediately re-render with the saved
     values (a cascading render React now flags). The initialiser is
     only called on the first render, and it's guarded for SSR since
     localStorage doesn't exist on the server. */
  const [draft, setDraft] = useState<OnboardingDraft>(() => {
    if (typeof window === "undefined") return EMPTY_DRAFT;
    try {
      const saved = window.localStorage.getItem(DRAFT_KEY);
      return saved ? { ...EMPTY_DRAFT, ...JSON.parse(saved) } : EMPTY_DRAFT;
    } catch {
      // Corrupt draft shouldn't block onboarding — start clean.
      return EMPTY_DRAFT;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch {
      // Private-mode / quota failures are non-fatal; the form still works.
    }
  }, [draft]);

  const set = <K extends keyof OnboardingDraft>(
    key: K,
    value: OnboardingDraft[K]
  ) => setDraft((d) => ({ ...d, [key]: value }));

  const bedTotal = useMemo(() => totalBedsIn(draft.roomTypes), [draft.roomTypes]);
  const roomTotal = useMemo(
    () => draft.roomTypes.reduce((s, r) => s + r.roomCount, 0),
    [draft.roomTypes]
  );

  /* ── Per-step validation ── */
  const stepValid = (() => {
    switch (step) {
      case 0:
        return (
          draft.name.trim().length > 2 &&
          draft.description.trim().length > 20 &&
          draft.address.trim().length > 5 &&
          draft.city.trim().length > 1
        );
      case 1:
        return draft.geopoint !== null;
      case 2:
        return (
          draft.roomTypes.length > 0 &&
          bedTotal > 0 &&
          bedTotal <= MAX_BEDS &&
          draft.roomTypes.every((r) => r.monthlyRent > 0 && r.roomCount > 0)
        );
      case 3:
        return draft.coverImageUrl.trim().length > 0;
      case 4:
        return (
          draft.verification.ownerFullName.trim().length > 2 &&
          /^\d{10}$/.test(draft.verification.ownerPhone.replace(/\D/g, "")) &&
          draft.verification.ownershipDocNumber.trim().length > 3
        );
      default:
        return false;
    }
  })();

  const addRoomType = () =>
    setDraft((d) => ({
      ...d,
      roomTypes: [
        ...d.roomTypes,
        {
          localId: crypto.randomUUID(),
          sharingType: 2 as SharingType,
          monthlyRent: 8000,
          roomCount: 1,
        },
      ],
    }));

  const updateRoomType = (localId: string, patch: Partial<DraftRoomType>) =>
    setDraft((d) => ({
      ...d,
      roomTypes: d.roomTypes.map((r) =>
        r.localId === localId ? { ...r, ...patch } : r
      ),
    }));

  const removeRoomType = (localId: string) =>
    setDraft((d) => ({
      ...d,
      roomTypes: d.roomTypes.filter((r) => r.localId !== localId),
    }));

  const handleSubmit = async () => {
    if (!user) return;
    setSubmitting(true);
    setSubmitError(null);

    const result = await submitProviderOnboarding(user.uid, draft);

    if (!result.success) {
      const messages: Record<string, string> = {
        "no-rooms": "Add at least one room type before submitting.",
        "no-location": "Drop a pin on the map to set your hostel's location.",
        "write-failed":
          "Couldn't save your listing. Check your connection and try again.",
      };
      setSubmitError(messages[result.reason] ?? "Something went wrong.");
      setSubmitting(false);
      return;
    }

    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {
      // Non-fatal.
    }
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gs-white text-gs-charcoal">
      <MarketplaceHeader />

      <div className="gs-container py-10 max-w-3xl">
        <h1 className="text-[clamp(28px,4vw,40px)] tracking-[-0.02em] mb-2">
          List your property
        </h1>
        <p className="text-gs-midgrey text-[15px] mb-8">
          Five short steps. Your progress is saved on this device as you go.
        </p>

        {/* Stepper */}
        <div className="flex items-center gap-2 mb-10 flex-wrap">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.06em] ${
                  i === step
                    ? "bg-gs-charcoal text-white"
                    : i < step
                      ? "bg-gs-offwhite text-gs-charcoal"
                      : "text-gs-midgrey"
                }`}
              >
                {i < step ? <Check size={12} /> : <span>{i + 1}</span>}
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* ── Step 0: Property basics ── */}
        {step === 0 && (
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className={labelClass}>Property name</label>
              <input
                className={inputClass}
                value={draft.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="e.g. Anand Niketan Residency"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className={labelClass}>Description</label>
              <textarea
                className={`${inputClass} min-h-[120px] resize-y`}
                value={draft.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="What makes your hostel a good place to live? Mention study facilities, meals, house rules…"
              />
              <span className="text-[12px] text-gs-midgrey">
                {draft.description.trim().length}/20 characters minimum
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <label className={labelClass}>Full address</label>
              <input
                className={inputClass}
                value={draft.address}
                onChange={(e) => set("address", e.target.value)}
                placeholder="Street, area, city, state, PIN"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className={labelClass}>City</label>
              <input
                className={inputClass}
                value={draft.city}
                onChange={(e) => set("city", e.target.value)}
                placeholder="e.g. Pune"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className={labelClass}>Nearby campuses</label>
              <div className="flex gap-2">
                <input
                  className={inputClass}
                  value={campusInput}
                  onChange={(e) => setCampusInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && campusInput.trim()) {
                      e.preventDefault();
                      set("campusNearby", [...draft.campusNearby, campusInput.trim()]);
                      setCampusInput("");
                    }
                  }}
                  placeholder="Type a campus and press Enter"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!campusInput.trim()) return;
                    set("campusNearby", [...draft.campusNearby, campusInput.trim()]);
                    setCampusInput("");
                  }}
                  className="px-5 rounded-xl border border-gs-charcoal text-[12px] font-bold uppercase tracking-[0.06em] hover:bg-gs-charcoal hover:text-white transition-colors cursor-pointer"
                >
                  Add
                </button>
              </div>
              {draft.campusNearby.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-1">
                  {draft.campusNearby.map((c, i) => (
                    <span
                      key={`${c}-${i}`}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gs-offwhite text-[13px]"
                    >
                      {c}
                      <button
                        type="button"
                        onClick={() =>
                          set(
                            "campusNearby",
                            draft.campusNearby.filter((_, idx) => idx !== i)
                          )
                        }
                        className="text-gs-midgrey hover:text-gs-charcoal cursor-pointer"
                        aria-label={`Remove ${c}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Step 1: Location ── */}
        {step === 1 && (
          <div className="flex flex-col gap-4">
            <p className="text-[15px] text-gs-darkgrey">
              Click the map to drop a pin where your hostel is. Students see
              this pin when browsing.
            </p>
            <div className="h-[420px] rounded-2xl overflow-hidden border border-gs-lightgrey">
              <LocationPicker
                value={draft.geopoint}
                onChange={(p) => set("geopoint", p)}
              />
            </div>
            <p className="text-[13px] text-gs-midgrey">
              {draft.geopoint
                ? `Pinned at ${draft.geopoint.lat.toFixed(5)}, ${draft.geopoint.lng.toFixed(5)}`
                : "No pin dropped yet."}
            </p>
          </div>
        )}

        {/* ── Step 2: Rooms & pricing ── */}
        {step === 2 && (
          <div className="flex flex-col gap-5">
            <p className="text-[15px] text-gs-darkgrey">
              Add each room type you offer. GridStay prices per bed, so a
              3-sharing room automatically creates three bookable beds.
            </p>

            {draft.roomTypes.map((room) => (
              <div
                key={room.localId}
                className="rounded-2xl border border-gs-lightgrey p-4 flex flex-col sm:flex-row gap-4 sm:items-end"
              >
                <div className="flex flex-col gap-2 flex-1">
                  <label className={labelClass}>Sharing</label>
                  <select
                    className={inputClass}
                    value={room.sharingType}
                    onChange={(e) =>
                      updateRoomType(room.localId, {
                        sharingType: Number(e.target.value) as SharingType,
                      })
                    }
                  >
                    {[1, 2, 3, 4].map((n) => (
                      <option key={n} value={n}>
                        {n}-sharing
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-2 flex-1">
                  <label className={labelClass}>Rent / bed / month (₹)</label>
                  <input
                    type="number"
                    min={1}
                    className={inputClass}
                    value={room.monthlyRent}
                    onChange={(e) =>
                      updateRoomType(room.localId, {
                        monthlyRent: Number(e.target.value),
                      })
                    }
                  />
                </div>

                <div className="flex flex-col gap-2 flex-1">
                  <label className={labelClass}>How many such rooms</label>
                  <input
                    type="number"
                    min={1}
                    className={inputClass}
                    value={room.roomCount}
                    onChange={(e) =>
                      updateRoomType(room.localId, {
                        roomCount: Number(e.target.value),
                      })
                    }
                  />
                </div>

                <button
                  type="button"
                  onClick={() => removeRoomType(room.localId)}
                  aria-label="Remove room type"
                  className="h-[46px] w-[46px] shrink-0 rounded-xl border border-gs-lightgrey flex items-center justify-center text-gs-midgrey hover:text-red-600 hover:border-red-300 transition-colors cursor-pointer"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={addRoomType}
              className="flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-gs-midgrey text-[12px] font-bold uppercase tracking-[0.06em] text-gs-charcoal hover:bg-gs-offwhite transition-colors cursor-pointer"
            >
              <Plus size={15} /> Add room type
            </button>

            {draft.roomTypes.length > 0 && (
              <div className="rounded-xl bg-gs-offwhite p-4 text-[14px]">
                <span className="font-semibold">
                  {roomTotal} room{roomTotal === 1 ? "" : "s"} · {bedTotal} bookable
                  bed{bedTotal === 1 ? "" : "s"}
                </span>
                {bedTotal > MAX_BEDS && (
                  <p className="text-red-600 text-[13px] mt-1">
                    That&apos;s over the {MAX_BEDS}-bed limit for a single
                    submission. Split it into multiple listings.
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Step 3: Photos & amenities ── */}
        {step === 3 && (
          <div className="flex flex-col gap-5">
            <div className="rounded-xl bg-gs-offwhite p-4 text-[13px] text-gs-darkgrey">
              Paste image links for now — direct file uploads need Firebase
              Storage, which requires a billing-enabled plan. Any publicly
              reachable image URL works.
            </div>

            <div className="flex flex-col gap-2">
              <label className={labelClass}>Cover image URL</label>
              <input
                className={inputClass}
                value={draft.coverImageUrl}
                onChange={(e) => set("coverImageUrl", e.target.value)}
                placeholder="https://…"
              />
              {draft.coverImageUrl.trim() && (
                // Plain <img>: next/image only permits hosts listed in
                // next.config.ts, and providers can paste any host.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={draft.coverImageUrl}
                  alt="Cover preview"
                  className="mt-2 w-full max-w-sm aspect-[4/3] object-cover rounded-xl border border-gs-lightgrey"
                />
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label className={labelClass}>Gallery image URLs</label>
              <div className="flex gap-2">
                <input
                  className={inputClass}
                  value={photoInput}
                  onChange={(e) => setPhotoInput(e.target.value)}
                  placeholder="https://…"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!photoInput.trim()) return;
                    set("photoUrls", [...draft.photoUrls, photoInput.trim()]);
                    setPhotoInput("");
                  }}
                  className="px-5 rounded-xl border border-gs-charcoal text-[12px] font-bold uppercase tracking-[0.06em] hover:bg-gs-charcoal hover:text-white transition-colors cursor-pointer"
                >
                  Add
                </button>
              </div>
              {draft.photoUrls.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {draft.photoUrls.map((url, i) => (
                    <div key={`${url}-${i}`} className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={url}
                        alt={`Gallery ${i + 1}`}
                        className="w-28 h-20 object-cover rounded-lg border border-gs-lightgrey"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          set("photoUrls", draft.photoUrls.filter((_, idx) => idx !== i))
                        }
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gs-charcoal text-white text-xs cursor-pointer"
                        aria-label="Remove photo"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label className={labelClass}>Amenities</label>
              <div className="flex flex-wrap gap-2">
                {AMENITY_OPTIONS.map((a) => {
                  const on = draft.amenities.includes(a.key);
                  return (
                    <button
                      key={a.key}
                      type="button"
                      onClick={() =>
                        set(
                          "amenities",
                          on
                            ? draft.amenities.filter((x) => x !== a.key)
                            : [...draft.amenities, a.key]
                        )
                      }
                      className={`px-4 py-2.5 rounded-full border text-[11px] font-bold uppercase tracking-[0.08em] transition-colors cursor-pointer ${
                        on
                          ? "bg-gs-charcoal text-white border-gs-charcoal"
                          : "bg-transparent text-gs-charcoal border-gs-lightgrey hover:border-gs-midgrey"
                      }`}
                    >
                      {a.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── Step 4: Verification ── */}
        {step === 4 && (
          <div className="flex flex-col gap-5">
            <div className="rounded-xl bg-gs-offwhite p-4 text-[13px] text-gs-darkgrey">
              These details are stored privately and are never shown on your
              public listing. GridStay reviews them before adding the
              &ldquo;Verified&rdquo; badge. We ask for document{" "}
              <strong>reference numbers</strong> rather than scans, so you
              don&apos;t have to upload identity documents anywhere.
            </div>

            <div className="flex flex-col gap-2">
              <label className={labelClass}>Owner full name (as on documents)</label>
              <input
                className={inputClass}
                value={draft.verification.ownerFullName}
                onChange={(e) =>
                  set("verification", {
                    ...draft.verification,
                    ownerFullName: e.target.value,
                  })
                }
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className={labelClass}>Contact phone (10 digits)</label>
              <input
                inputMode="numeric"
                className={inputClass}
                value={draft.verification.ownerPhone}
                onChange={(e) =>
                  set("verification", {
                    ...draft.verification,
                    ownerPhone: e.target.value,
                  })
                }
                placeholder="9876543210"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className={labelClass}>Ownership proof type</label>
              <select
                className={inputClass}
                value={draft.verification.ownershipDocType}
                onChange={(e) =>
                  set("verification", {
                    ...draft.verification,
                    ownershipDocType: e.target.value,
                  })
                }
              >
                {OWNERSHIP_DOC_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className={labelClass}>Document / receipt number</label>
              <input
                className={inputClass}
                value={draft.verification.ownershipDocNumber}
                onChange={(e) =>
                  set("verification", {
                    ...draft.verification,
                    ownershipDocNumber: e.target.value,
                  })
                }
                placeholder="As printed on the document"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className={labelClass}>
                Trade / municipal licence no. (optional)
              </label>
              <input
                className={inputClass}
                value={draft.verification.tradeLicenceNumber}
                onChange={(e) =>
                  set("verification", {
                    ...draft.verification,
                    tradeLicenceNumber: e.target.value,
                  })
                }
              />
            </div>

            {submitError && (
              <p className="text-sm text-red-600">{submitError}</p>
            )}
          </div>
        )}

        {/* ── Nav ── */}
        <div className="flex items-center justify-between mt-10 pt-6 border-t border-gs-lightgrey">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="text-[12px] font-bold uppercase tracking-[0.08em] text-gs-midgrey hover:text-gs-charcoal disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            Back
          </button>

          {step < STEPS.length - 1 ? (
            <button
              type="button"
              disabled={!stepValid}
              onClick={() => setStep((s) => s + 1)}
              className="bg-gs-charcoal text-white text-[12px] font-bold uppercase tracking-[0.1em] px-8 py-3.5 rounded-full disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gs-black transition-colors cursor-pointer"
            >
              Continue
            </button>
          ) : (
            <button
              type="button"
              disabled={!stepValid || submitting}
              onClick={handleSubmit}
              className="bg-gs-charcoal text-white text-[12px] font-bold uppercase tracking-[0.1em] px-8 py-3.5 rounded-full disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gs-black transition-colors cursor-pointer"
            >
              {submitting ? "Publishing…" : "Submit listing"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
