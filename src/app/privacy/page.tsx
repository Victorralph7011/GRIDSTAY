import Link from "next/link";

export const metadata = { title: "Privacy Policy — GridStay" };

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gs-white text-gs-charcoal flex items-center justify-center px-6">
      <div className="max-w-lg text-center flex flex-col items-center gap-4 py-24">
        <h1
          className="text-3xl tracking-[-0.02em]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Privacy Policy
        </h1>
        <p className="text-gs-midgrey leading-relaxed">
          We&apos;re still finalizing our formal privacy policy, including how
          we handle Aadhaar and payment data. In the meantime, reach out and
          we&apos;ll answer directly.
        </p>
        <a
          href="mailto:hello@gridstay.in?subject=Privacy%20Policy%20Question"
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
