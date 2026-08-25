const formatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

interface PriceBadgeProps {
  amount: number;
  /** GridStay prices per bed, not per room — label reflects that by default. */
  suffix?: string;
  className?: string;
}

export default function PriceBadge({
  amount,
  suffix = "/bed/mo",
  className = "",
}: PriceBadgeProps) {
  return (
    <span className={`whitespace-nowrap ${className}`}>
      <span
        className="font-bold"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {formatter.format(amount)}
      </span>
      <span className="text-gs-midgrey text-sm">{suffix}</span>
    </span>
  );
}
