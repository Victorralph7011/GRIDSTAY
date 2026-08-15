"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/firebase/useAuth";

/**
 * Airbnb-style account menu: a single avatar trigger replacing the
 * Login/Signup control once a user is signed in. Shared by the
 * landing page's Header and the marketplace's MarketplaceHeader so
 * the two can't drift into two different "logged in" experiences —
 * same lesson as EchoStackLogo: one implementation, every surface
 * imports it rather than hand-rolling its own copy.
 */
export default function ProfileMenu() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!user) return null;

  const initial = (user.displayName?.trim() || user.email || "?")
    .charAt(0)
    .toUpperCase();
  const primaryHref = user.role === "provider" ? "/dashboard" : "/bookings";
  const primaryLabel = user.role === "provider" ? "Dashboard" : "My Bookings";

  const handleSignOut = async () => {
    setOpen(false);
    await signOut();
    router.push("/");
  };

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label="Account menu"
        className="w-9 h-9 rounded-full bg-gs-charcoal text-white flex items-center justify-center text-[13px] font-bold cursor-pointer shrink-0"
      >
        {initial}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-gs-lightgrey bg-gs-white shadow-[0_16px_48px_rgba(0,0,0,0.14)] py-2 z-50">
          <div className="px-4 py-2.5 border-b border-gs-lightgrey mb-1">
            <p className="text-sm font-semibold text-gs-charcoal truncate">
              {user.displayName?.trim() || "GridStay Account"}
            </p>
            <p className="text-xs text-gs-midgrey truncate">{user.email}</p>
          </div>

          <Link
            href={primaryHref}
            onClick={() => setOpen(false)}
            className="block px-4 py-2.5 text-sm text-gs-charcoal hover:bg-gs-offwhite no-underline"
          >
            {primaryLabel}
          </Link>

          {user.role === "student" && (
            <Link
              href="/explore"
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 text-sm text-gs-charcoal hover:bg-gs-offwhite no-underline"
            >
              Explore Stays
            </Link>
          )}

          <button
            type="button"
            onClick={handleSignOut}
            className="w-full text-left px-4 py-2.5 text-sm text-gs-midgrey hover:bg-gs-offwhite hover:text-gs-charcoal cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
