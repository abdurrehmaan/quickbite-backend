import Customer from '../models/Customer.js';
import Restaurant from '../models/Restaurant.js';
import Order from '../models/Order.js';
import Item from '../models/Item.js';
import { calculateDeliveryFee } from '../pricing/pricingEngine.js';
import { applyPromotions } from './promoService.js';
import { NotFoundError, ValidationError } from '../middleware/errorHandler.js';
import logger from '../utils/logger.js';

export async function createOrder(data) {
  const { customerId, restaurantId, items, placedAt } = data;

  // Fetch customer and restaurant with error handling
  const [customer, restaurant] = await Promise.all([
    Customer.findById(customerId),
    Restaurant.findById(restaurantId)
  ]);

  if (!customer) {
    throw new NotFoundError('Customer');
  }
  
  if (!restaurant) {
    throw new NotFoundError('Restaurant');
  }

  // Fetch items with error handling
  const itemIds = items.map(i => i.productId);
  const itemDocs = await Item.find({ _id: { $in: itemIds } });

  if (itemDocs.length !== itemIds.length) {
    const foundIds = itemDocs.map(doc => doc._id.toString());
    const missingIds = itemIds.filter(id => !foundIds.includes(id));
    throw new ValidationError('Some items not found', [
      { field: 'items', message: `Items not found: ${missingIds.join(', ')}` }
    ]);
  }

  // Enrich items with prices
  const enriched = items.map(i => {
    const itemDoc = itemDocs.find(x => x._id.toString() === i.productId);
    return {
      productId: i.productId,
      qty: i.qty,
      unitPrice: itemDoc.price
    };
  });

  // Calculate base price
  const basePrice = enriched.reduce((sum, item) => sum + item.qty * item.unitPrice, 0);

  if (basePrice <= 0) {
    throw new ValidationError('Invalid order total', [
      { field: 'items', message: 'Order total must be greater than 0' }
    ]);
  }

  // Calculate delivery fee
  const delivery = await calculateDeliveryFee(customer, restaurant, placedAt);
  
  // Apply promotions
  const promo = await applyPromotions({ basePrice }, customer, restaurant);

  // Calculate final total
  const finalTotal = Math.max(0, basePrice + delivery.deliveryFee - promo.discount);

  logger.info('Order calculation complete', {
    basePrice,
    deliveryFee: delivery.deliveryFee,
    discount: promo.discount,
    finalTotal
  });

  // Create order
  const order = await Order.create({
    customerId,
    restaurantId,
    items: enriched,
    basePrice,
    deliveryFee: delivery.deliveryFee,
    promoDiscount: promo.discount,
    finalTotal,
    breakdown: { ...delivery, appliedPromos: promo.applied },
    placedAt,
    status: 'pending'
  });

  return order;
}

export async function getOrder(id) {
  const order = await Order.findById(id)
    .populate('customerId', 'name email')
    .populate('restaurantId', 'name location')
    .lean();
  
  return order;
}