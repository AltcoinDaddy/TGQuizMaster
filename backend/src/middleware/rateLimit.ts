import rateLimit from 'express-rate-limit';

/**
 * Rate limiter for financial/sensitive endpoints.
 * Limits each IP to 10 requests per minute.
 */
export const financialRateLimit = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later' }
});

/**
 * Stricter rate limiter for withdrawal endpoints.
 * Limits each IP to 3 requests per minute.
 */
export const withdrawalRateLimit = rateLimit({
    windowMs: 60 * 1000,
    max: 3,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many withdrawal attempts, please try again later' }
});

/**
 * General API rate limiter.
 * Limits each IP to 60 requests per minute.
 */
export const generalRateLimit = rateLimit({
    windowMs: 60 * 1000,
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Rate limit exceeded' }
});
