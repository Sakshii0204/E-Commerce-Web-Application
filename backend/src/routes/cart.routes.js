import { Router } from 'express';
import {
  getCart,
  addItem,
  updateQuantity,
  removeItem,
  clearCart,
} from '../controllers/cart.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  addCartItemSchema,
  updateCartItemSchema,
  productIdParamSchema,
} from '../validators/cart.validator.js';

const router = Router();

// All cart operations require authentication
router.use(authenticate);

router.get('/', getCart);
router.post('/items', validate(addCartItemSchema), addItem);
router.put('/items/:productId', validate(updateCartItemSchema), updateQuantity);
router.delete('/items/:productId', validate(productIdParamSchema), removeItem);
router.delete('/', clearCart);

export const cartRoutes = router;
