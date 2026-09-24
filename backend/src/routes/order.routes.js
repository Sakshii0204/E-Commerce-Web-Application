import { Router } from 'express';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  getAdminOrders,
  getAdminOrderById,
  updateOrderStatus,
  getDashboardStats,
} from '../controllers/order.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/authorize.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  createOrderSchema,
  orderIdParamSchema,
  adminOrderQuerySchema,
  updateOrderStatusSchema,
} from '../validators/order.validator.js';

const router = Router();

// All order endpoints require authentication
router.use(authenticate);

// Admin-only endpoints (MUST come before /:id to prevent route shadowing)
router.get(
  '/admin',
  authorize('ADMIN'),
  validate(adminOrderQuerySchema),
  getAdminOrders
);

router.get(
  '/admin/dashboard',
  authorize('ADMIN'),
  getDashboardStats
);

router.get(
  '/admin/:id',
  authorize('ADMIN'),
  validate(orderIdParamSchema),
  getAdminOrderById
);

router.patch(
  '/admin/:id/status',
  authorize('ADMIN'),
  validate(updateOrderStatusSchema),
  updateOrderStatus
);

// Customer order endpoints
// Note: /my-orders MUST come before /:id to prevent route shadowing
router.post('/', validate(createOrderSchema), createOrder);
router.get('/my-orders', getMyOrders);
router.get('/:id', validate(orderIdParamSchema), getOrderById);

export const orderRoutes = router;

