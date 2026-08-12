"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function ShowcaseGrid() {
  return (
    <section
      id="discover"
      style={{ background: "#111111" }}
    >
      <div className="gs-container" style={{ paddingTop: "128px", paddingBottom: "128px" }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex justify-between items-end mb-16 flex-col sm:flex-row gap-5"
        >
          <div>
            <span
              className="text-xs font-bold tracking-[0.12em] uppercase block mb-3"
              style={{ color: "#838282" }}
            >
              Verified Living
            </span>
            <h2
              className="leading-none tracking-[-0.04em]"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(40px, 5vw, 64px)",
                color: "#ffffff",
              }}
            >
              Premium Stays
            </h2>
          </div>
          <a
            href="#"
            className="no-underline text-sm pb-1"
            style={{
              color: "#ffffff",
              borderBottom: "1px solid rgba(255,255,255,0.3)",
            }}
          >
            View All Properties
          </a>
        </motion.div>

        {/* Two-column showcase grid matching template */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Left: Circular masked image — GEN-Z DORMS */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.77, 0, 0.175, 1] }}
            className="relative overflow-hidden rounded-full group md:col-span-5"
            style={{
              aspectRatio: "1 / 1",
              background: "#2a2a2a",
            }}
          >
            <Image
              src="/shared_dorm.png"
              alt="Gen-Z Shared Dorms"
              fill
              className="object-cover transition-all duration-700 group-hover:scale-105"
            />
            <div
              className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 rounded-full z-10"
              style={{
                background: "rgba(0, 0, 0, 0.6)",
                backdropFilter: "blur(8px)",
              }}
            >
              <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-white">
                Gen-Z Dorms
              </span>
            </div>
          </motion.div>

          {/* Right: Large rectangular image — Smart Shared Living */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.7,
              delay: 0.15,
              ease: [0.77, 0, 0.175, 1],
            }}
            className="relative overflow-hidden group md:col-span-7"
            style={{
              borderRadius: "4px",
              minHeight: "520px",
              background: "#2a2a2a",
            }}
          >
            <Image
              src="/coliving_space.png"
              alt="Smart Shared Living"
              fill
              className="object-cover transition-all duration-700 group-hover:scale-105"
            />
            <div className="absolute bottom-6 left-6 z-10">
              <h3
                className="text-xl text-white mb-1"
                style={{
                  fontFamily: "var(--font-display)",
                  textShadow: "0 2px 12px rgba(0,0,0,0.5)",
                }}
              >
                Smart Shared Living
              </h3>
              <p
                className="text-xs uppercase tracking-[0.08em]"
                style={{ color: "rgba(255,255,255,0.7)" }}
              >
                4-Sharing · Individual Lockers · Study Lamps
              </p>
            </div>
            {/* Verified badge */}
            <div
              className="absolute bottom-5 right-5 flex items-center gap-2 px-4 py-2 rounded-full z-10"
              style={{
                background: "rgba(0,0,0,0.6)",
                backdropFilter: "blur(8px)",
              }}
            >
              <span
                className="w-2 h-2 rounded-full animate-pulse-dot"
                style={{ background: "#4ADE80", boxShadow: "0 0 6px #4ADE80" }}
              />
              <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-white">
                Verified Orbit
              </span>
            </div>
          </motion.div>
        </div>

        {/* Second row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mt-8">
          {/* Premium Co-Living — large rect */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.77, 0, 0.175, 1] }}
            className="relative overflow-hidden group md:col-span-8"
            style={{
              borderRadius: "4px",
              height: "520px",
              background: "#2a2a2a",
            }}
          >
            <Image
              src="/hero_lounge.png"
              alt="Premium Co-Living Lounge"
              fill
              className="object-cover transition-all duration-700 group-hover:scale-105"
            />
            <div className="absolute bottom-6 left-6 z-10">
              <h3
                className="text-xl text-white"
                style={{
                  fontFamily: "var(--font-display)",
                  textShadow: "0 2px 12px rgba(0,0,0,0.5)",
                }}
              >
                Premium Co-Living
              </h3>
              <p
                className="text-xs uppercase tracking-[0.08em] mt-1"
                style={{ color: "rgba(255,255,255,0.7)" }}
              >
                Designer common areas · Smart access
              </p>
            </div>
            <div
              className="absolute bottom-5 right-5 flex items-center gap-2 px-4 py-2 rounded-full z-10"
              style={{
                background: "rgba(0,0,0,0.6)",
                backdropFilter: "blur(8px)",
              }}
            >
              <span
                className="w-2 h-2 rounded-full animate-pulse-dot"
                style={{ background: "#4ADE80", boxShadow: "0 0 6px #4ADE80" }}
              />
              <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-white">
                Verified Orbit
              </span>
            </div>
          </motion.div>

          {/* Elite Single — tall pill */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.77, 0, 0.175, 1] }}
            className="relative overflow-hidden group md:col-span-4"
            style={{
              borderRadius: "9999px",
              height: "520px",
              background: "#2a2a2a",
            }}
          >
            <Image
              src="/premium_single_room.png"
              alt="Elite Single Studio"
              fill
              className="object-cover transition-all duration-700 group-hover:scale-105"
            />
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[160px] h-[160px] rounded-full flex items-center justify-center text-center p-5 opacity-0 group-hover:opacity-100 transition-all duration-700 pointer-events-none z-10"
              style={{
                background: "rgba(255,255,255,0.92)",
                border: "1px solid rgba(30,30,30,0.08)",
              }}
            >
              <p className="text-xs uppercase tracking-[0.1em] text-[#111] font-bold">
                Elite Single Studios
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
