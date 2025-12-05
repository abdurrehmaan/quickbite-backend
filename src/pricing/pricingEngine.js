import { getDistanceKm } from "./distanceService.js";
import { getZonePricing } from "./zonePricing.js";
import { getPeakMultiplier } from "./peakService.js";

export async function calculateDeliveryFee(customer, restaurant, placedAt) {
  const distance = getDistanceKm(customer.location, restaurant.location);
  const zone = await getZonePricing(customer.zone);
  const base = zone.baseFee + distance * zone.perKmRate;
  const peakMultiplier = getPeakMultiplier(placedAt);

  return {
    distance,
    zoneBaseFee: zone.baseFee,
    perKmRate: zone.perKmRate,
    peakMultiplier,
    deliveryFee: base * peakMultiplier
  };
}