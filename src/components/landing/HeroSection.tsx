"use client";

import { motion } from "framer-motion";
import EchoStackLogo from "@/components/ui/EchoStackLogo";

export default function HeroSection() {
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
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.77, 0, 0.175, 1] }}
        style={{ marginBottom: "48px" }}
      >
        <EchoStackLogo size="clamp(72px, 11vw, 180px)" echo />
      </motion.div>

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
