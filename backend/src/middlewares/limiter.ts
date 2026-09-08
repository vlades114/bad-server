import { rateLimit } from 'express-rate-limit'

export const limiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 50,
    standardHeaders: true,
    legacyHeaders: false,
})
