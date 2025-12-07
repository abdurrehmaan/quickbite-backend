import express from 'express';
import { createOrderController, getOrderController } from '../controllers/orderController.js';
import { validate, orderSchemas } from '../middleware/validator.js';
import { strictLimiter } from '../middleware/security.js';

const router = express.Router();

router.post('/', strictLimiter, validate(orderSchemas.createOrder), createOrderController);

router.get('/:id', validate(orderSchemas.getOrder, 'params'), getOrderController);

export default router;