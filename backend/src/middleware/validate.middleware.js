import { AppError } from '../utils/AppError.js';

export const validate = (schema) => (req, res, next) => {
  try {
    const toValidate = {};
    if (schema.shape?.body) toValidate.body = req.body;
    if (schema.shape?.params) toValidate.params = req.params;
    if (schema.shape?.query) toValidate.query = req.query;

    const target = Object.keys(toValidate).length > 0 ? toValidate : req.body;
    const parsed = schema.safeParse(target);

    if (!parsed.success) {
      const fieldErrors = parsed.error.errors.map((err) => ({
        field: err.path.join('.').replace(/^(body|params|query)\./, ''),
        message: err.message,
      }));
      const primaryMessage = fieldErrors[0]?.message || 'Invalid input data';
      return next(new AppError(primaryMessage, 400, fieldErrors));
    }

    if (parsed.data.body) req.body = parsed.data.body;
    if (parsed.data.params) req.params = parsed.data.params;
    if (parsed.data.query) req.query = parsed.data.query;

    next();
  } catch (err) {
    next(err);
  }
};

export const validateBody = (schema) => (req, res, next) => {
  try {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      const fieldErrors = parsed.error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
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

