import { authService } from '../services/auth.service.js';
import { COOKIE_NAME, getCookieOptions } from '../utils/jwt.js';

export const authController = {
  async register(req, res, next) {
    try {
      const { user, token } = await authService.register(req.body);

      // Set HttpOnly cookie
      res.cookie(COOKIE_NAME, token, getCookieOptions());

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        user
      });
    } catch (error) {
      next(error);
    }
  },

  async login(req, res, next) {
    try {
      const { user, token } = await authService.login(req.body);

      // Set HttpOnly cookie
      res.cookie(COOKIE_NAME, token, getCookieOptions());

      res.status(200).json({
        success: true,
        message: 'Login successful',
        user
      });
    } catch (error) {
      next(error);
    }
  },

  async logout(req, res, next) {
    try {
      const cookieOpts = getCookieOptions();
      res.clearCookie(COOKIE_NAME, {
        httpOnly: cookieOpts.httpOnly,
        sameSite: cookieOpts.sameSite,
        secure: cookieOpts.secure
      });

      res.status(200).json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  async getMe(req, res, next) {
    try {
      const user = await authService.getCurrentUser(req.user.id);
      res.status(200).json({
        success: true,
        user
      });
    } catch (error) {
      next(error);
    }
  },

  async adminCheck(req, res) {
    res.status(200).json({
      success: true,
      message: 'Admin authorization verified',
      user: req.user
    });
  }
};
