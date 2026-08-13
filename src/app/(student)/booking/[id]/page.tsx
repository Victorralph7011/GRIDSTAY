"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getBooking, confirmBooking, type Booking } from "@/lib/firebase/bookings";
import {
  getProperty,
  getRoomsByProperty,
  type Property,
  type Room,
} from "@/lib/firebase/properties";
import { useAuth } from "@/lib/firebase/useAuth";
import {
  generateContract,
  initiateAadhaarESign,
  verifyAndSign,
} from "@/lib/esign/contracts";
import { createRentOrder } from "@/lib/razorpay/payments";
import PriceBadge from "@/components/marketplace/PriceBadge";

type FlowStep =
  | "loading"
  | "esign-aadhaar"
  | "esign-otp"
  | "payment"
  | "confirmed"
  | "error";

const addMonths = (isoDate: string, months: number) => {
  const d = new Date(isoDate);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().split("T")[0];
};

export default function BookingConfirmationPage() {
  const params = useParams<{ id: string }>();
  const bookingId = Array.isArray(params.id) ? params.id[0] : params.id;
  const { user } = useAuth();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [property, setProperty] = useState<Property | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [step, setStep] = useState<FlowStep>("loading");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [aadhaar, setAadhaar] = useState("");
  const [otp, setOtp] = useState("");
  const [contractId, setContractId] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);

  useEffect(() => {
    if (!bookingId) return;
    (async () => {
      try {
        const b = await getBooking(bookingId);
        if (!b) {
          setErrorMsg("Booking not found.");
          setStep("error");
          return;
        }
        const [prop, rooms] = await Promise.all([
          getProperty(b.propertyId),
          getRoomsByProperty(b.propertyId),
        ]);
        setBooking(b);
        setProperty(prop);
        setRoom(rooms.find((r) => r.id === b.roomId) ?? null);
        setStep(b.status === "confirmed" ? "confirmed" : "esign-aadhaar");
      } catch {
        setErrorMsg("Couldn't load your reservation. Please try again.");
        setStep("error");
      }
    })();
  }, [bookingId]);

  const handleGenerateAndInitiate = async () => {
    if (!booking || !property || !room || !user) return;
    const digits = aadhaar.replace(/\s/g, "");
    if (digits.length !== 12) {
      setErrorMsg("Enter a valid 12-digit Aadhaar number.");
      return;
    }
    setBusy(true);
    setErrorMsg(null);

    try {
      const newContractId = await generateContract({
        tenantName: user.displayName || user.email || "Tenant",
        tenantAadhaar: digits,
        // TODO: owner name/Aadhaar need a provider-profile lookup that
        // doesn't exist in the data layer yet — placeholder until then.
        ownerName: "Property Owner",
        ownerAadhaar: "",
        propertyId: property.id,
        roomId: room.id,
        bedId: booking.bedId,
        monthlyRent: room.monthlyRent,
        securityDeposit: room.monthlyRent * 2,
        startDate: booking.moveInDate,
        endDate: addMonths(booking.moveInDate, 11),
        termsMarkdown: "",
      });

      if (!newContractId) {
        setBusy(false);
        setErrorMsg(
          "Digital contract signing isn't connected yet (needs a live Zoop/Digio integration). Your reservation is saved — contact support to complete signing."
        );
        return;
      }

      setContractId(newContractId);
      const esignResult = await initiateAadhaarESign(newContractId, digits);
      setBusy(false);

      if (!esignResult) {
        setErrorMsg("Couldn't start Aadhaar verification. Please try again.");
        return;
      }
      setTransactionId(esignResult.transactionId);
      setStep("esign-otp");
    } catch {
      setBusy(false);
      setErrorMsg("Something went wrong generating your contract. Please try again.");
    }
  };

  const handleVerifyOtp = async () => {
    if (!transactionId) return;
    setBusy(true);
    setErrorMsg(null);
    try {
      const signed = await verifyAndSign(transactionId, otp);
      setBusy(false);
      if (!signed) {
        setErrorMsg("OTP verification failed. Please try again.");
        return;
      }
      setStep("payment");
    } catch {
      setBusy(false);
      setErrorMsg("Something went wrong verifying your OTP. Please try again.");
    }
  };

  const handlePay = async () => {
    if (!booking || !room || !user) return;
    setBusy(true);
    setErrorMsg(null);

    try {
      const order = await createRentOrder(user.uid, booking.propertyId, room.monthlyRent, {
        ownerShare: 85,
        platformCommission: 10,
        utilitySplit: 3,
        laundrySplit: 2,
      });

      if (!order) {
        setBusy(false);
        setErrorMsg(
          "Payment isn't connected yet (needs a live Razorpay integration). Your reservation is saved — contact support to complete payment."
        );
        return;
      }

      // In a real flow, Razorpay Checkout opens here and this only runs
      // after the user actually completes payment in that UI.
      await finalizeBooking(order.orderId);
    } catch {
      setBusy(false);
      setErrorMsg("Something went wrong starting payment. Please try again.");
    }
  };

  const finalizeBooking = async (paymentId: string) => {
    if (!booking || !user || !contractId) return;
    setBusy(true);

    let result: Awaited<ReturnType<typeof confirmBooking>>;
    try {
      result = await confirmBooking(booking.id, user.uid, contractId, paymentId);
    } catch {
      setBusy(false);
      setErrorMsg("Couldn't confirm your booking — please try again.");
      return;
    }
    setBusy(false);

    if (!result.success) {
      const messages: Record<string, string> = {
        "bed-unavailable":
          "This bed was just booked by someone else — please choose another listing.",
        "booking-not-found": "This booking couldn't be found.",
        "bed-not-found": "This bed no longer exists.",
        "already-confirmed": "This booking is already confirmed.",
      };
      setErrorMsg(messages[result.reason] ?? "Couldn't confirm your booking.");
      setStep("error");
      return;
    }
    setStep("confirmed");
  };

  if (step === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center text-gs-midgrey text-sm">
        Loading your reservation…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gs-white text-gs-charcoal">
      <div className="gs-container py-10 max-w-lg mx-auto flex flex-col gap-8">
        <div>
          <h1 className="text-3xl mb-2">Complete Your Reservation</h1>
          {property && room && (
            <div className="flex items-baseline justify-between text-sm text-gs-midgrey mt-2">
              <span>
                {property.name} · {room.sharingType}-Sharing
              </span>
              <PriceBadge amount={room.monthlyRent} />
            </div>
          )}
        </div>

        {step === "esign-aadhaar" && (
          <div className="listing-card p-6 flex flex-col gap-5">
            <h2 className="text-sm font-bold uppercase tracking-[0.06em]">
              Step 1 · Sign Rental Agreement
            </h2>
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold tracking-[0.1em] uppercase text-gs-midgrey">
                Aadhaar Number
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={14}
                value={aadhaar}
                onChange={(e) => setAadhaar(e.target.value)}
                placeholder="1234 5678 9012"
                className="glass-input"
              />
            </div>
            <button
              type="button"
              disabled={busy}
              onClick={handleGenerateAndInitiate}
              className="w-full bg-gs-charcoal text-white font-bold uppercase tracking-[0.1em] py-4 rounded-full disabled:opacity-60 cursor-pointer"
            >
              {busy ? "Generating…" : "Generate & Sign Contract"}
            </button>
          </div>
        )}

        {step === "esign-otp" && (
          <div className="listing-card p-6 flex flex-col gap-5">
            <h2 className="text-sm font-bold uppercase tracking-[0.06em]">
              Step 1 · Verify OTP
            </h2>
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold tracking-[0.1em] uppercase text-gs-midgrey">
                OTP sent to your Aadhaar-linked mobile
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="6-digit code"
                className="glass-input"
              />
            </div>
            <button
              type="button"
              disabled={busy}
              onClick={handleVerifyOtp}
              className="w-full bg-gs-charcoal text-white font-bold uppercase tracking-[0.1em] py-4 rounded-full disabled:opacity-60 cursor-pointer"
            >
              {busy ? "Verifying…" : "Verify & Continue"}
            </button>
          </div>
        )}

        {step === "payment" && (
          <div className="listing-card p-6 flex flex-col gap-5">
            <h2 className="text-sm font-bold uppercase tracking-[0.06em]">
              Step 2 · Payment
            </h2>
            <p className="text-sm text-gs-midgrey">
              Contract signed. Pay your first month&apos;s rent to confirm this
              bed.
            </p>
            <button
              type="button"
              disabled={busy}
              onClick={handlePay}
              className="w-full bg-gs-charcoal text-white font-bold uppercase tracking-[0.1em] py-4 rounded-full disabled:opacity-60 cursor-pointer"
            >
              {busy ? "Processing…" : "Pay & Confirm Booking"}
            </button>
          </div>
        )}

        {step === "confirmed" && (
          <div className="listing-card p-6 flex flex-col gap-3 items-center text-center">
            <h2 className="text-sm font-bold uppercase tracking-[0.06em]">
              Booking Confirmed
            </h2>
            <p className="text-sm text-gs-midgrey">
              Your bed is reserved. See you at move-in!
            </p>
          </div>
        )}

        {step === "error" && errorMsg && (
          <p className="text-sm text-red-600 text-center">{errorMsg}</p>
        )}

        {errorMsg && step !== "error" && (
          <p className="text-sm text-red-600">{errorMsg}</p>
        )}
      </div>
    </div>
  );
}
