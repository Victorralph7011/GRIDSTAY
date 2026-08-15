"use client";

import Link from "next/link";
import { useAuth } from "@/lib/firebase/useAuth";
import ProfileMenu from "@/components/auth/ProfileMenu";

/**
 * Sticky top bar for the student marketplace. Deliberately lighter
 * than the landing page's transparent-over-video header — these pages
 * scroll content under it, so it stays opaque and bordered throughout.
 */
export default function MarketplaceHeader() {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-gs-white/90 backdrop-blur-md border-b border-gs-lightgrey">
      <div className="gs-container h-[72px] flex items-center justify-between gap-6">
        <Link
          href="/"
          className="no-underline shrink-0"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "20px",
            fontWeight: 700,
            letterSpacing: "-0.02em",
            textTransform: "uppercase",
            color: "var(--color-gs-charcoal)",
          }}
        >
          GridStay
        </Link>

        <nav className="flex items-center gap-2 sm:gap-6">
          <Link
            href="/explore"
            className="hidden sm:block no-underline text-[12px] font-semibold uppercase tracking-[0.08em] text-gs-darkgrey hover:text-gs-black transition-colors"
          >
            Explore
          </Link>

          {user ? (
            <ProfileMenu />
          ) : (
            <Link
              href="/auth/login"
              className="no-underline text-[12px] font-semibold uppercase tracking-[0.08em] text-gs-charcoal px-6 py-2.5 rounded-full border border-gs-charcoal hover:bg-gs-charcoal hover:text-gs-white transition-colors"
            >
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
