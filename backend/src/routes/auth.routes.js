import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { registerSchema, loginSchema } from '../validators/auth.validator.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/authorize.middleware.js';

const router = Router();

// Public routes
router.post('/register', validateBody(registerSchema), authController.register);
router.post('/login', validateBody(loginSchema), authController.login);
router.post('/logout', authController.logout);

// Protected routes
router.get('/me', authenticate, authController.getMe);
router.get('/admin-check', authenticate, authorize('ADMIN'), authController.adminCheck);

export default router;
