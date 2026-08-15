"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/firebase/useAuth";
import ProfileMenu from "@/components/auth/ProfileMenu";

export default function Header() {
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className="fixed top-0 left-0 w-full h-20 z-50 flex items-center justify-between transition-all duration-500"
      style={{
        background: scrolled ? "rgba(255, 255, 255, 0.95)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled
          ? "1px solid rgba(0, 0, 0, 0.06)"
          : "1px solid transparent",
        paddingLeft: "max(24px, 4vw)",
        paddingRight: "max(24px, 4vw)",
      }}
    >
      <Link
        href="/"
        className="no-underline"
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "22px",
          fontWeight: 700,
          letterSpacing: "-0.02em",
          textTransform: "uppercase",
          color: "#111111",
        }}
      >
        GridStay
      </Link>

      <nav className="flex gap-8 items-center">
        {[
          { label: "Discover", id: "discover" },
          { label: "For Owners", id: "owners" },
          { label: "Business OS", id: "os" },
        ].map(({ label, id }) => (
          <Link
            key={label}
            href={`#${id}`}
            className="no-underline hidden md:block"
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "13px",
              fontWeight: 500,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "#333333",
              transition: "color 200ms",
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.color = "#000000";
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.color = "#333333";
            }}
          >
            {label}
          </Link>
        ))}

        {user ? (
          <ProfileMenu />
        ) : (
          <Link
            href="/auth/login"
            className="no-underline"
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "13px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "#111111",
              padding: "10px 24px",
              borderRadius: "9999px",
              border: "1px solid #111111",
              transition: "all 300ms",
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.background = "#111111";
              (e.target as HTMLElement).style.color = "#ffffff";
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.background = "transparent";
              (e.target as HTMLElement).style.color = "#111111";
            }}
          >
            Login / Signup
          </Link>
        )}
      </nav>
    </header>
  );
}
