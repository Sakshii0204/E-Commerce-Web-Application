import { AppError } from '../utils/AppError.js';

export const validateBody = (schema) => (req, res, next) => {
  try {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      const fieldErrors = parsed.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));
      const primaryMessage = fieldErrors[0]?.message || 'Invalid input data';
      return next(new AppError(primaryMessage, 400, fieldErrors));
    }
    req.body = parsed.data;
    next();
  } catch (err) {
    next(err);
  }
};
