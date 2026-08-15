"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/lib/firebase/useAuth";

/**
 * The landing page itself stays identical for every visitor — same
 * sections, same order, same structure, for both students and owners.
 * Only this closing CTA adapts, and only for a signed-in provider:
 * inviting an already-registered owner to sign up again is a dead
 * end, so a provider sees a dashboard shortcut here instead of the
 * generic pitch a new visitor sees.
 */
export default function CTASection() {
  const { user } = useAuth();
  const isProvider = user?.role === "provider";

  return (
    <section style={{ background: "#111111" }}>
      <div
        className="gs-container text-center flex flex-col items-center"
        style={{ paddingTop: "128px", paddingBottom: "128px" }}
      >
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.77, 0, 0.175, 1] }}
          className="leading-[1.1] mb-6 tracking-[-0.03em]"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(48px, 6vw, 80px)",
            color: "#ffffff",
          }}
        >
          {isProvider ? (
            <>
              Manage Your
              <br />
              <em
                style={{
                  fontFamily: "Georgia, serif",
                  fontStyle: "italic",
                  fontWeight: 400,
                  color: "#b6b5b5",
                }}
              >
                Properties
              </em>
            </>
          ) : (
            <>
              Ready to Digitize
              <br />
              Your{" "}
              <em
                style={{
                  fontFamily: "Georgia, serif",
                  fontStyle: "italic",
                  fontWeight: 400,
                  color: "#b6b5b5",
                }}
              >
                PG?
              </em>
            </>
          )}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="text-lg max-w-[600px] mb-10 leading-relaxed"
          style={{
            fontFamily: "var(--font-body)",
            color: "#838282",
            fontWeight: 400,
          }}
        >
          {isProvider
            ? "Head to your dashboard to add listings, track occupancy, and manage bed-level inventory."
            : "Join 1,000+ owners using GridStay to automate their business and maximize occupancy."}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex gap-4 flex-wrap justify-center"
        >
          {isProvider ? (
            <Link href="/dashboard" className="btn-light">
              Go to Dashboard
            </Link>
          ) : (
            <>
              {/* White button on dark section */}
              <Link href="/auth/signup?role=provider" className="btn-light">
                List Property
              </Link>
              <a
                href="mailto:hello@gridstay.in?subject=Book%20a%20Demo"
                className="btn-outline-light"
              >
                Book a Demo
              </a>
            </>
          )}
        </motion.div>
      </div>
    </section>
  );
}
