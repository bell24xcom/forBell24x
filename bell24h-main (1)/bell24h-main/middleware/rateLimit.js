// middleware/rateLimit.js - API Rate Limiting
// Prevents server overload and abuse

const rateLimit = require('express-rate-limit');

// General API rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many requests',
      message: 'Please slow down and try again later',
      retryAfter: Math.round(req.rateLimit.resetTime / 1000)
    });
  }
});

// Strict rate limiting for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 auth requests per windowMs
  message: {
    error: 'Too many authentication attempts, please try again later.',
    retryAfter: '15 minutes'
  },
  skipSuccessfulRequests: true, // Don't count successful requests
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many authentication attempts',
      message: 'Please wait before trying to authenticate again',
      retryAfter: Math.round(req.rateLimit.resetTime / 1000)
    });
  }
});

// Strict rate limiting for OTP endpoints
const otpLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 3, // limit each IP to 3 OTP requests per 5 minutes
  message: {
    error: 'Too many OTP requests, please try again later.',
    retryAfter: '5 minutes'
  },
  skipSuccessfulRequests: true,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many OTP requests',
      message: 'Please wait before requesting another OTP',
      retryAfter: Math.round(req.rateLimit.resetTime / 1000)
    });
  }
});

// Admin endpoints rate limiting
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 admin requests per windowMs
  message: {
    error: 'Too many admin requests, please try again later.',
    retryAfter: '15 minutes'
  },
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many admin requests',
      message: 'Please slow down your admin operations',
      retryAfter: Math.round(req.rateLimit.resetTime / 1000)
    });
  }
});

// File upload rate limiting
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // limit each IP to 10 uploads per hour
  message: {
    error: 'Too many file uploads, please try again later.',
    retryAfter: '1 hour'
  },
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many file uploads',
      message: 'Please wait before uploading more files',
      retryAfter: Math.round(req.rateLimit.resetTime / 1000)
    });
  }
});

module.exports = {
  generalLimiter,
  authLimiter,
  otpLimiter,
  adminLimiter,
  uploadLimiter
};
