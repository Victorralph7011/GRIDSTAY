"use client";

import { Globe, Send, Mail, MapPin } from "lucide-react";

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
              {[
                "Search Stays",
                "Premium Listings",
                "Verified Properties",
                "For Students",
              ].map((l) => (
                <li key={l}>
                  <a
                    href="#"
                    className="text-sm transition-colors duration-200 hover:text-white no-underline"
                    style={{ color: "rgba(255,255,255,0.5)" }}
                  >
                    {l}
                  </a>
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
              {[
                "About GridStay",
                "Careers",
                "Privacy Policy",
                "Terms of Service",
              ].map((l) => (
                <li key={l}>
                  <a
                    href="#"
                    className="text-sm transition-colors duration-200 hover:text-white no-underline"
                    style={{ color: "rgba(255,255,255,0.5)" }}
                  >
                    {l}
                  </a>
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
                  href="#"
                  className="text-sm transition-colors duration-200 hover:text-white no-underline"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                >
                  hello@gridstay.in
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm transition-colors duration-200 hover:text-white no-underline"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                >
                  +91 90000 00000
                </a>
              </li>
              <li className="mt-5">
                <a
                  href="#"
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
            {[Globe, Send, Mail].map((Icon, i) => (
              <a
                key={i}
                href="#"
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
