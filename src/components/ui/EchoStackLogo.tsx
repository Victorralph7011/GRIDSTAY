"use client";

interface EchoStackLogoProps {
  /**
   * CSS font-size for the front layer. Echo offsets are expressed in
   * `em`, so the whole mark scales proportionally from this one value.
   */
  size?: string;
  /**
   * Render the echo trail. Only switch this on for display-size type
   * (~72px+). The offsets are proportional, so below roughly 60px the
   * five layers collapse into a few pixels and read as a muddy drop
   * shadow rather than a trail — small placements want the clean
   * wordmark instead.
   */
  echo?: boolean;
  className?: string;
}

/**
 * EchoStackLogo — GridStay's "Echo Stack" wordmark.
 *
 * The solid charcoal wordmark sits in front of four progressively
 * lighter grey copies offset *upward*, producing a motion-trail that
 * reads as the mark rising into place. Offsets must stay negative:
 * pushing them downward turns the trail into what looks like a muddy
 * drop shadow.
 *
 * Single source of truth for the logo — the landing hero, login, and
 * signup all render this so the mark can't drift between surfaces.
 */

const ECHO_LAYERS = [
  { offsetY: "-0.156em", color: "#e0e0e0", opacity: 0.35 },
  { offsetY: "-0.117em", color: "#d6d6d6", opacity: 0.5 },
  { offsetY: "-0.078em", color: "#cccccc", opacity: 0.65 },
  { offsetY: "-0.039em", color: "#c2c2c2", opacity: 0.8 },
];

const WORDMARK_TYPE: React.CSSProperties = {
  fontFamily: "var(--font-display)",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "-0.05em",
  lineHeight: 0.9,
};

export default function EchoStackLogo({
  size = "40px",
  echo = false,
  className = "",
}: EchoStackLogoProps) {
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      {echo &&
        ECHO_LAYERS.map((layer, i) => (
          <span
            key={i}
            aria-hidden="true"
            className="absolute select-none pointer-events-none whitespace-nowrap"
            style={{
              ...WORDMARK_TYPE,
              fontSize: size,
              color: layer.color,
              opacity: layer.opacity,
              transform: `translateY(${layer.offsetY})`,
              zIndex: i + 1,
            }}
          >
            GRIDSTAY
          </span>
        ))}

      <span
        className="relative whitespace-nowrap"
        style={{
          ...WORDMARK_TYPE,
          fontSize: size,
          color: "var(--color-gs-charcoal)",
          zIndex: 5,
        }}
      >
        GRIDSTAY
      </span>
    </div>
  );
}
