import Link from "next/link";

export const metadata = { title: "Terms of Service — GridStay" };

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gs-white text-gs-charcoal flex items-center justify-center px-6">
      <div className="max-w-lg text-center flex flex-col items-center gap-4 py-24">
        <h1
          className="text-3xl tracking-[-0.02em]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Terms of Service
        </h1>
        <p className="text-gs-midgrey leading-relaxed">
          Our formal terms of service are still being finalized. If you have
          questions about booking, cancellation, or provider agreements in
          the meantime, reach out directly.
        </p>
        <a
          href="mailto:hello@gridstay.in?subject=Terms%20of%20Service%20Question"
          className="text-sm font-bold uppercase tracking-[0.08em] underline"
        >
          hello@gridstay.in
        </a>
        <Link href="/" className="text-sm text-gs-midgrey underline mt-4">
          Back to GridStay
        </Link>
      </div>
    </div>
  );
}
