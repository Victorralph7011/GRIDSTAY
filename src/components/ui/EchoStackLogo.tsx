"use client";

interface EchoStackLogoProps {
  /** Font size of the front (solid) layer, e.g. "text-5xl" */
  size?: string;
  className?: string;
}

/**
 * EchoStackLogo — GridStay's "Echo Stack" wordmark.
 *
 * 5 stacked layers of "GRIDSTAY": the front layer is solid black,
 * the 4 layers behind it are light-grey with descending opacity and
 * an ascending Y-axis offset, producing a motion-trail effect.
 *
 * This is the single source of truth for the logo — HeroSection,
 * the login page, and the signup page all render this component so
 * the mark never drifts out of sync between surfaces.
 */
export default function EchoStackLogo({
  size = "text-5xl",
  className = "",
}: EchoStackLogoProps) {
  return (
    <div className={`relative flex items-center justify-center h-16 w-full ${className}`}>
      <span className={`absolute font-[family-name:var(--font-display)] font-black ${size} uppercase tracking-widest text-black/[0.02] translate-y-[16px]`}>
        GRIDSTAY
      </span>
      <span className={`absolute font-[family-name:var(--font-display)] font-black ${size} uppercase tracking-widest text-black/[0.05] translate-y-[12px]`}>
        GRIDSTAY
      </span>
      <span className={`absolute font-[family-name:var(--font-display)] font-black ${size} uppercase tracking-widest text-black/[0.15] translate-y-[8px]`}>
        GRIDSTAY
      </span>
      <span className={`absolute font-[family-name:var(--font-display)] font-black ${size} uppercase tracking-widest text-black/[0.25] translate-y-[4px]`}>
        GRIDSTAY
      </span>
      <span className={`absolute font-[family-name:var(--font-display)] font-black ${size} uppercase tracking-widest text-black z-10`}>
        GRIDSTAY
      </span>
    </div>
  );
}
