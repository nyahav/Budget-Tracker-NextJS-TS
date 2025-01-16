import rateLimit from 'express-rate-limit';
import { Request } from 'express';

/**
 * Creates a rate limiter with specific settings.
 * @param windowMs - Time window in milliseconds.
 * @param maxRequests - Maximum requests allowed within the time window.
 * @returns The rate limiter middleware function.
 */
const createRateLimiter = (windowMs: number, maxRequests: number) => {
  return rateLimit({
    windowMs, // Time window for rate limiting (e.g., 1 second, 10 seconds, 30 seconds)
    max: maxRequests, // Maximum number of requests allowed within window
    keyGenerator: (req: Request): string => {
      // Extract the client's IP address, taking the first forwarded IP or falling back to remoteAddress
      const forwardedFor = req.headers['x-forwarded-for'];
      const clientIp = (Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor) || req.connection.remoteAddress;
      return clientIp ? clientIp : ''; // Ensure we always return a string
    },
    message: 'Too many requests, please try again later.',
  });
};

export const shortRateLimiter = createRateLimiter(1 * 1000, 3); // 1 second, max 3 requests
export const mediumRateLimiter = createRateLimiter(10 * 1000, 5); // 10 seconds, max 5 requests
export const longRateLimiter = createRateLimiter(30 * 1000, 10); // 30 seconds, max 10 requests
