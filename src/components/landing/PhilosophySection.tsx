"use client";

import { motion } from "framer-motion";

const stats = [
  {
    title: "Verified Listings",
    body: "Every property is verified via photo and video metadata to eliminate ghost listings and fake ads. Trust is the foundation of our marketplace.",
    stat: "↑ 25% Occupancy Growth",
  },
  {
    title: "Standardized Living",
    body: "We enforce quality benchmarks across hygiene, safety, and amenities — turning chaotic PGs into institutional-grade living assets.",
    stat: "95% Maintenance Rate",
  },
  {
    title: "Zero Friction Ops",
    body: "From tenant onboarding to rent collection to complaint resolution, every operational touchpoint is digitized and automated.",
    stat: "↓ 10+ hrs/week saved",
  },
];

export default function PhilosophySection() {
  return (
    <section
      id="owners"
      style={{ background: "#F7F7F7" }}
      className="flex flex-col items-center"
    >
      <div className="gs-container w-full flex flex-col items-center" style={{ paddingTop: "128px", paddingBottom: "128px" }}>
        {/* Hairline divider */}
        <div
          className="w-px mb-16"
          style={{ height: "80px", background: "rgba(0, 0, 0, 0.08)" }}
        />

        {/* Quote */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.77, 0, 0.175, 1] }}
          className="text-center leading-[1.1] tracking-[-0.02em]"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(32px, 4vw, 64px)",
            color: "#111111",
            maxWidth: "1100px",
            marginBottom: "96px",
          }}
        >
          &ldquo;The future of housing isn&rsquo;t about buildings — it&rsquo;s about{" "}
          <em
            className="not-italic"
            style={{
              fontFamily: "Georgia, serif",
              fontStyle: "italic",
              fontWeight: 400,
              color: "#838282",
            }}
          >
            systems
          </em>{" "}
          that make them intelligent.&rdquo;
        </motion.h2>

        {/* 3-col grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 w-full">
          {stats.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.6,
                delay: i * 0.15,
                ease: [0.77, 0, 0.175, 1],
              }}
            >
              <h3
                className="text-2xl mb-4 tracking-[-0.02em]"
                style={{
                  fontFamily: "var(--font-display)",
                  color: "#111111",
                }}
              >
                {item.title}
              </h3>
              <p
                className="leading-relaxed"
                style={{
                  fontFamily: "var(--font-body)",
                  color: "#838282",
                  fontSize: "15px",
                  fontWeight: 400,
                }}
              >
                {item.body}
              </p>
              <span
                className="inline-block mt-5 font-bold text-sm uppercase tracking-[0.05em]"
                style={{ color: "#111111" }}
              >
                {item.stat}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
