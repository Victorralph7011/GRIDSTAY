"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  LayoutGrid,
  IndianRupee,
  FileSignature,
  ArrowRight,
} from "lucide-react";

const features = [
  {
    icon: LayoutGrid,
    title: "Bed Management",
    body: "Bed-level real-time sync. Manage 1, 2, 3, and 4-sharing vacancies with bed-specific status tracking — Available, Occupied, or Maintenance.",
  },
  {
    icon: IndianRupee,
    title: "Rent Automation",
    body: "Automated billing and payouts. One-click rent collection with splits for electricity, laundry, and platform commissions via Razorpay Route.",
  },
  {
    icon: FileSignature,
    title: "Smart Contracts",
    body: "Legally binding Aadhaar eSign. Generate and sign rental agreements instantly with Aadhaar-based OTP verification and automated e-stamping.",
  },
];

export default function ServicesSection() {
  return (
    <section
      id="os"
      style={{ background: "#FFFFFF" }}
    >
      <div className="gs-container" style={{ paddingTop: "128px", paddingBottom: "128px" }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span
            className="inline-block px-5 py-1.5 rounded-full text-xs font-bold uppercase tracking-[0.1em] mb-6"
            style={{
              border: "1px solid #d0d0d0",
              color: "#838282",
              background: "transparent",
            }}
          >
            The Operating System
          </span>
          <h2
            className="tracking-[-0.04em]"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(40px, 4vw, 56px)",
              color: "#111111",
            }}
          >
            Hostel Management OS
          </h2>
        </motion.div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feat, i) => (
            // `className="contents"` keeps the <a> out of the grid's
            // layout tree so .feature-card is still the actual grid
            // item — otherwise wrapping it here would break the
            // grid-cols-3 sizing above.
            <Link
              key={i}
              href="/auth/signup?role=provider"
              className="contents"
            >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.6,
                delay: i * 0.12,
                ease: [0.77, 0, 0.175, 1],
              }}
              className="feature-card cursor-pointer group"
            >
              {/* Background shape */}
              <div className="bg-shape" />

              {/* Icon */}
              <div className="icon-wrap relative z-[1]">
                <feat.icon size={22} />
              </div>

              {/* Content */}
              <h4
                className="text-2xl mb-4 tracking-[-0.02em] relative z-[1]"
                style={{
                  fontFamily: "var(--font-display)",
                  color: "#111111",
                }}
              >
                {feat.title}
              </h4>
              <p
                className="text-[15px] leading-relaxed mb-10 flex-grow relative z-[1]"
                style={{
                  color: "#838282",
                  fontWeight: 400,
                }}
              >
                {feat.body}
              </p>

              {/* CTA */}
              <div
                className="flex items-center gap-2 uppercase tracking-[0.1em] font-bold text-[13px] relative z-[1]"
                style={{ color: "#111111" }}
              >
                Explore <ArrowRight size={16} />
              </div>
            </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
