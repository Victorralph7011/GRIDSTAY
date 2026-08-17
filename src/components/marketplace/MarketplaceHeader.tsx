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
  const { user, loading } = useAuth();

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
          {/* Owners get their operational sections here; everyone else
              gets the marketplace entry point. */}
          {user?.role === "provider" ? (
            <>
              <Link
                href="/dashboard"
                className="hidden sm:block no-underline text-[12px] font-semibold uppercase tracking-[0.08em] text-gs-darkgrey hover:text-gs-black transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/tenants"
                className="hidden sm:block no-underline text-[12px] font-semibold uppercase tracking-[0.08em] text-gs-darkgrey hover:text-gs-black transition-colors"
              >
                Tenants
              </Link>
              <Link
                href="/maintenance"
                className="hidden sm:block no-underline text-[12px] font-semibold uppercase tracking-[0.08em] text-gs-darkgrey hover:text-gs-black transition-colors"
              >
                Maintenance
              </Link>
            </>
          ) : (
            <Link
              href="/explore"
              className="hidden sm:block no-underline text-[12px] font-semibold uppercase tracking-[0.08em] text-gs-darkgrey hover:text-gs-black transition-colors"
            >
              Explore
            </Link>
          )}

          {/* While auth resolves, show a neutral placeholder rather
              than the Login pill — otherwise every page load flashes
              "LOGIN" at an already-signed-in user, which reads as
              being logged out or asked to log in again. */}
          {loading ? (
            <div
              className="w-9 h-9 rounded-full bg-gs-lightgrey animate-pulse"
              aria-hidden
            />
          ) : user ? (
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
