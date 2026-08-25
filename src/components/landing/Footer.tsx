"use client";

import Link from "next/link";
import { Globe, Send, Mail, MapPin } from "lucide-react";

const EXPLORE_LINKS = [
  { label: "Search Stays", href: "/explore" },
  { label: "Premium Listings", href: "/explore" },
  // subscribeToProperties always filters verified:true, so /explore's
  // contents already ARE "verified properties" — no separate view exists
  // or needs to.
  { label: "Verified Properties", href: "/explore" },
  { label: "For Students", href: "/explore" },
];

const COMPANY_LINKS = [
  // The landing page IS the about-us content — no separate page exists.
  { label: "About GridStay", href: "/" },
  { label: "Careers", href: "mailto:hello@gridstay.in?subject=Careers" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
];

export default function Footer() {
  return (
    <footer style={{ background: "#111111", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="gs-container" style={{ paddingTop: "96px", paddingBottom: "40px" }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-20">
          {/* Brand */}
          <div>
            <h5
              className="text-2xl uppercase tracking-[-0.02em] mb-5"
              style={{ fontFamily: "var(--font-display)", color: "#ffffff" }}
            >
              GRIDSTAY
            </h5>
            <p
              className="text-sm leading-relaxed max-w-[300px]"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              The digital operating system for managed living. Transforming
              hostels and PGs into high-performance, standardized business assets
              across India.
            </p>
          </div>

          {/* Explore */}
          <div>
            <h5 className="text-sm font-bold uppercase tracking-[0.08em] mb-6 text-white">
              Explore
            </h5>
            <ul className="list-none space-y-3">
              {EXPLORE_LINKS.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-sm transition-colors duration-200 hover:text-white no-underline"
                    style={{ color: "rgba(255,255,255,0.5)" }}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h5 className="text-sm font-bold uppercase tracking-[0.08em] mb-6 text-white">
              Company
            </h5>
            <ul className="list-none space-y-3">
              {COMPANY_LINKS.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-sm transition-colors duration-200 hover:text-white no-underline"
                    style={{ color: "rgba(255,255,255,0.5)" }}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h5 className="text-sm font-bold uppercase tracking-[0.08em] mb-6 text-white">
              Contact
            </h5>
            <ul className="list-none space-y-3">
              <li>
                <a
                  href="mailto:hello@gridstay.in"
                  className="text-sm transition-colors duration-200 hover:text-white no-underline"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                >
                  hello@gridstay.in
                </a>
              </li>
              <li>
                <a
                  href="tel:+919000000000"
                  className="text-sm transition-colors duration-200 hover:text-white no-underline"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                >
                  +91 90000 00000
                </a>
              </li>
              <li className="mt-5">
                <a
                  href="https://www.google.com/maps/search/?api=1&query=Bangalore,India"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm flex items-center gap-2 transition-colors duration-200 hover:text-white no-underline"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                >
                  <MapPin size={16} /> Bangalore, IN
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div
          className="flex justify-between items-center pt-6 text-sm"
          style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
        >
          <div style={{ color: "rgba(255,255,255,0.4)" }}>
            &copy; 2026 GridStay. All rights reserved.
          </div>
          <div className="flex gap-5">
            {/* No real social presence exists yet — these route to
                actual contact channels rather than fabricated profile
                URLs. Swap in real social links once those exist. */}
            {[
              { Icon: Globe, href: "/", label: "GridStay home" },
              {
                Icon: Send,
                href: "mailto:hello@gridstay.in?subject=General%20Inquiry",
                label: "Send an inquiry",
              },
              {
                Icon: Mail,
                href: "mailto:hello@gridstay.in?subject=Support",
                label: "Email support",
              },
            ].map(({ Icon, href, label }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="transition-colors duration-200 hover:text-white"
                style={{ color: "rgba(255,255,255,0.4)" }}
              >
                <Icon size={20} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
