import { Router } from 'express';
import {
  getProducts,
  getProductById,
  getProductFilters,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/product.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/authorize.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  createProductSchema,
  updateProductSchema,
  objectIdSchema,
} from '../validators/product.validator.js';

const router = Router();

// Public catalog routes
// Note: /filters must be mounted before /:id to prevent route collision
router.get('/', getProducts);
router.get('/filters', getProductFilters);
router.get('/:id', validate(objectIdSchema), getProductById);

// Admin product mutation routes (strictly require authenticate + authorize('ADMIN'))
router.post(
  '/',
  authenticate,
  authorize('ADMIN'),
  validate(createProductSchema),
  createProduct
);

router.put(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  validate(updateProductSchema),
  updateProduct
);

router.delete(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  validate(objectIdSchema),
  deleteProduct
);

export const productRoutes = router;
