import DeliveryZone from "../models/DeliveryZone.js";
export async function getZonePricing(zone) {
  return await DeliveryZone.findOne({ zone });
}