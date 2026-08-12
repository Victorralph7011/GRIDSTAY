"use client";

import { motion } from "framer-motion";

export default function HeroSection() {
  const echoLayers = [
    { offsetY: -28, color: "#e0e0e0", opacity: 0.35 },
    { offsetY: -21, color: "#d6d6d6", opacity: 0.5 },
    { offsetY: -14, color: "#cccccc", opacity: 0.65 },
    { offsetY: -7, color: "#c2c2c2", opacity: 0.8 },
  ];

  return (
    <section className="relative min-h-screen w-full flex flex-col items-center justify-center pt-20 overflow-hidden">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover -z-10"
      >
        <source src="/assets/hero-bg.mp4" type="video/mp4" />
      </video>

      {/* Subtle Overlay */}
      <div className="absolute inset-0 w-full h-full bg-white/60 -z-10" />

      {/* Echo Stack */}
      <div
        className="relative flex items-center justify-center"
        style={{ marginBottom: "48px" }}
      >
        {/* Background echo layers */}
        {echoLayers.map((layer, i) => (
          <span
            key={i}
            className="absolute select-none pointer-events-none"
            aria-hidden="true"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(72px, 11vw, 180px)",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "-0.05em",
              lineHeight: 0.9,
              color: layer.color,
              opacity: layer.opacity,
              transform: `translateY(${layer.offsetY}px)`,
              zIndex: i + 1,
            }}
          >
            GRIDSTAY
          </span>
        ))}

        {/* Front layer — BLACK text */}
        <motion.span
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.77, 0, 0.175, 1] }}
          className="relative"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(72px, 11vw, 180px)",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "-0.05em",
            lineHeight: 0.9,
            color: "#111111",
            zIndex: 5,
            display: "block",
          }}
        >
          GRIDSTAY
        </motion.span>
      </div>

      {/* Subtext */}
      <motion.p
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3, ease: [0.77, 0, 0.175, 1] }}
        className="max-w-[680px] text-center px-6 relative z-10"
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "17px",
          lineHeight: 1.7,
          color: "#838282",
          fontWeight: 400,
        }}
      >
        The Digital Operating System for Managed Living. We transform
        unorganized hostels and PGs into high-performance, standardized business
        assets.
      </motion.p>
    </section>
  );
}
