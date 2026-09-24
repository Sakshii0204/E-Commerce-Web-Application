const requestCounts = new Map();

/**
 * Lightweight in-memory rate limiter for authentication routes.
 * Defends against automated brute force without adding complex external dependencies.
 */
export const authRateLimiter = ({ windowMs = 15 * 60 * 1000, maxRequests = 100 } = {}) => {
  return (req, res, next) => {
    // Bypass in test environment to avoid interfering with test suites
    if (process.env.NODE_ENV === 'test') {
      return next();
    }

    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown_ip';
    const now = Date.now();
    const record = requestCounts.get(ip) || { count: 0, resetTime: now + windowMs };

    if (now > record.resetTime) {
      record.count = 1;
      record.resetTime = now + windowMs;
    } else {
      record.count += 1;
    }

    requestCounts.set(ip, record);

    if (record.count > maxRequests) {
      return res.status(429).json({
        success: false,
        message: 'Too many authentication attempts. Please try again after 15 minutes.',
      });
    }

    next();
  };
};
