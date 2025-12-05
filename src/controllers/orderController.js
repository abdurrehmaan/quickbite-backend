import { createOrder, getOrder } from '../services/orderService.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { NotFoundError } from '../middleware/errorHandler.js';
import logger from '../utils/logger.js';

export const createOrderController = asyncHandler(async (req, res) => {
  logger.info('Creating order', { customerId: req.body.customerId });
  
  const order = await createOrder(req.body);
  
  logger.info('Order created successfully', { orderId: order._id });
  
  res.status(201).json(order);
});

export const getOrderController = asyncHandler(async (req, res) => {
  const order = await getOrder(req.params.id);
  
  if (!order) {
    throw new NotFoundError('Order');
  }
  
  res.json(order);
});