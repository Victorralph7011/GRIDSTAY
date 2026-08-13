/**
 * Canonical amenity keys and their display labels.
 *
 * Shared so the filter bar and the listing page can't disagree, and so
 * acronyms render correctly — CSS `capitalize` would turn "wifi" into
 * "Wifi" and "ac" into "Ac".
 */
export const AMENITY_OPTIONS = [
  { key: "wifi", label: "WiFi" },
  { key: "laundry", label: "Laundry" },
  { key: "mess", label: "Mess" },
  { key: "ac", label: "Air Conditioning" },
  { key: "power-backup", label: "Power Backup" },
  { key: "security", label: "24/7 Security" },
] as const;

const LABELS = new Map<string, string>(
  AMENITY_OPTIONS.map((a) => [a.key, a.label])
);

/** Falls back to title-casing unknown keys rather than dropping them. */
export function amenityLabel(key: string): string {
  return (
    LABELS.get(key) ??
    key
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ")
  );
}
