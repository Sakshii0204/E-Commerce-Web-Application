import { verifyToken, COOKIE_NAME } from '../utils/jwt.js';
import { userRepository } from '../repositories/user.repository.js';
import { AppError } from '../utils/AppError.js';

export const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies?.[COOKIE_NAME];

    if (!token) {
      return next(new AppError('Authentication required. Please log in.', 401));
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return next(new AppError('Your session has expired. Please log in again.', 401));
      }
      return next(new AppError('Invalid authentication token.', 401));
    }

    const currentUser = await userRepository.findById(decoded.userId);
    if (!currentUser) {
      return next(new AppError('The user belonging to this session no longer exists.', 401));
    }

    req.user = {
      id: currentUser.id,
      name: currentUser.name,
      email: currentUser.email,
      role: currentUser.role
    };

    next();
  } catch (error) {
    next(error);
  }
};
