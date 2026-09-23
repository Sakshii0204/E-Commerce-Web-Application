import { Router } from 'express';
import {
  createOrder,
  getMyOrders,
  getOrderById,
} from '../controllers/order.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  createOrderSchema,
  orderIdParamSchema,
} from '../validators/order.validator.js';

const router = Router();

// All customer order endpoints require authentication
router.use(authenticate);

// Note: /my-orders MUST come before /:id to prevent route shadowing
router.post('/', validate(createOrderSchema), createOrder);
router.get('/my-orders', getMyOrders);
router.get('/:id', validate(orderIdParamSchema), getOrderById);

export const orderRoutes = router;
