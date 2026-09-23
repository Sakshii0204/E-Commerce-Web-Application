import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const COOKIE_NAME = 'novamart_token';

export const generateToken = (payload) => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN
  });
};

export const verifyToken = (token) => {
  return jwt.verify(token, env.JWT_SECRET);
};

export const getCookieOptions = () => {
  const isProduction = env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    sameSite: isProduction ? 'none' : 'lax',
    secure: isProduction,
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in ms
  };
};
