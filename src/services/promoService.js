import Promo from "../models/Promo.js";

export async function applyPromotions(order, customer, restaurant) {
  const promos = await Promo.find({ active: true });
  let discount = 0;
  let applied = [];

  for (const p of promos) {
    if (p.type === "FIRST_ORDER" && !customer.firstOrderCompleted) {
      discount += order.basePrice * p.discount;
      applied.push(p.name);
    }
    if (p.type === "RESTAURANT" && p.restaurantId === restaurant._id) {
      discount += order.basePrice * p.discount;
      applied.push(p.name);
    }
    if (p.type === "ZONE" && p.zone === customer.zone) {
      discount += p.flat;
      applied.push(p.name);
    }
  }

  return { discount, applied };
}