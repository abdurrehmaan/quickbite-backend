import peakRules from "../config/peakRules.json" with { type: "json" };

export function getPeakMultiplier(placedAt) {
  const hour = new Date(placedAt).getUTCHours();
  for (const r of peakRules) if (hour >= r.start && hour < r.end) return r.multiplier;
  return 1;
}