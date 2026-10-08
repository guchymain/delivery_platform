const { rateLimit } = require("express-rate-limit")

const limitReached = (req, res) => {
  res.status(429).json({
    success: false,
    message: "Too many requests, please try again later"
  })
}

// Strict limit for auth endpoints to protect against brute force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: limitReached
})

// General limit for general API endpoints
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: limitReached
})

module.exports = { authLimiter, apiLimiter }
