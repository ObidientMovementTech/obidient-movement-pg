import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import xss from 'xss';
import hpp from 'hpp';
import { body, validationResult } from 'express-validator';
import winston from 'winston';

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'obidient-api' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

// Rate limiting for registration (most restrictive)
export const registerRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // limit each IP to 3 registration attempts per windowMs
  message: {
    error: 'Too many registration attempts from this IP, please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Registration rate limit exceeded for IP: ${req.ip}`, {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    });
    res.status(429).json({
      success: false,
      message: 'Too many registration attempts from this IP, please try again after 15 minutes.',
      errorType: 'RATE_LIMIT_EXCEEDED'
    });
  }
});

// Rate limiting for login
export const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 login attempts per windowMs
  message: {
    error: 'Too many login attempts from this IP, please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Login rate limit exceeded for IP: ${req.ip}`, {
      ip: req.ip,
      email: req.body.email,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    });
    res.status(429).json({
      success: false,
      message: 'Too many login attempts from this IP, please try again after 15 minutes.',
      errorType: 'RATE_LIMIT_EXCEEDED'
    });
  }
});

// General API rate limiting
export const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Password reset rate limiting
export const passwordResetRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each IP to 3 password reset attempts per hour
  message: {
    error: 'Too many password reset attempts from this IP, please try again after 1 hour.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Email verification resend rate limiting
export const emailResendRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 3, // limit each IP to 3 resend attempts per 5 minutes
  message: {
    error: 'Too many email resend attempts from this IP, please try again after 5 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Enhanced helmet configuration
export const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

// Input sanitization middleware
export const sanitizeInput = (req, res, next) => {
  // Enhanced sanitization function for PostgreSQL security
  const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;

    // XSS protection
    let sanitized = xss(str, {
      whiteList: {}, // No HTML allowed
      stripIgnoreTag: true,
      stripIgnoreTagBody: ['script']
    });

    // SQL injection protection - remove dangerous patterns
    sanitized = sanitized.replace(/['";\\]/g, ''); // Remove quotes and backslashes
    sanitized = sanitized.replace(/--/g, ''); // Remove SQL comments
    sanitized = sanitized.replace(/\/\*/g, ''); // Remove SQL block comments
    sanitized = sanitized.replace(/\*\//g, ''); // Remove SQL block comments

    return sanitized;
  };

  const sanitizeObject = (obj, depth = 0) => {
    // Prevent deep recursion
    if (depth > 10) return obj;

    const sanitized = {};

    for (let key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        if (typeof obj[key] === 'string') {
          sanitized[key] = sanitizeString(obj[key]);
        } else if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
          sanitized[key] = sanitizeObject(obj[key], depth + 1);
        } else if (Array.isArray(obj[key])) {
          sanitized[key] = obj[key].map(item => {
            if (typeof item === 'string') {
              return sanitizeString(item);
            } else if (typeof item === 'object' && item !== null) {
              return sanitizeObject(item, depth + 1);
            }
            return item;
          });
        } else {
          sanitized[key] = obj[key];
        }
      }
    }

    return sanitized;
  };

  // Sanitize request body - this is safe to modify
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }

  // For query params, create a sanitized version without modifying the original
  if (req.query && typeof req.query === 'object') {
    req.sanitizedQuery = sanitizeObject(req.query);
  }

  // Sanitize params - this is safe to modify
  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeObject(req.params);
  }

  next();
};

// Request logging middleware
export const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      duration: `${duration}ms`,
      timestamp: new Date().toISOString()
    };

    if (res.statusCode >= 400) {
      logger.error('HTTP Error', logData);
    } else {
      logger.info('HTTP Request', logData);
    }
  });

  next();
};

// Registration input validation
export const validateRegistration = [
  body('name')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('Name can only contain letters, spaces, hyphens and apostrophes')
    .trim()
    .escape(),

  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .isLength({ max: 100 })
    .withMessage('Email must not exceed 100 characters'),

  body('phone')
    .isMobilePhone()
    .withMessage('Please provide a valid phone number')
    .isLength({ min: 10, max: 15 })
    .withMessage('Phone number must be between 10 and 15 characters'),

  body('password')
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be between 8 and 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),

  body('countryCode')
    .optional()
    .isLength({ max: 10 })
    .withMessage('Country code must not exceed 10 characters'),

  body('votingState')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Voting state must not exceed 50 characters')
    .matches(/^[a-zA-Z\s-]+$/)
    .withMessage('Voting state can only contain letters, spaces, and hyphens'),

  body('votingLGA')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Voting LGA must not exceed 50 characters')
    .matches(/^[a-zA-Z\s-]+$/)
    .withMessage('Voting LGA can only contain letters, spaces, and hyphens'),

  body('country')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Country must not exceed 50 characters')
    .matches(/^[a-zA-Z\s-]+$/)
    .withMessage('Country can only contain letters, spaces, and hyphens'),

  body('isDiaspora')
    .optional()
    .isBoolean()
    .withMessage('isDiaspora must be a boolean value'),
];

// Login input validation
export const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('password')
    .isLength({ min: 1 })
    .withMessage('Password is required'),
];

// Password reset validation
export const validatePasswordReset = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
];

// New password validation
export const validateNewPassword = [
  body('password')
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be between 8 and 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
];

// Validation result handler
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.path,
      message: error.msg,
      value: error.value
    }));

    logger.warn('Validation errors', {
      ip: req.ip,
      errors: errorMessages,
      timestamp: new Date().toISOString()
    });

    return res.status(400).json({
      success: false,
      message: 'Invalid input data',
      errors: errorMessages,
      errorType: 'VALIDATION_ERROR'
    });
  }
  next();
};

// Suspicious activity detection
export const detectSuspiciousActivity = (req, res, next) => {
  const suspiciousPatterns = [
    /\b(script|javascript|vbscript|onload|onerror)\b/i,
    /\b(union|select|insert|delete|drop|create|alter|truncate)\b/i,
    /<[^>]*>/g, // HTML tags
    /\$\{.*\}/g, // Template literals
    /eval\(/i,
    /document\./i,
    /window\./i,
    /--/g, // SQL comments
    /\/\*/g, // SQL block comments start
    /\*\//g, // SQL block comments end
    /;/g, // SQL statement terminator (in suspicious contexts)
    /\bor\s+1\s*=\s*1\b/i, // Classic SQL injection
    /\band\s+1\s*=\s*1\b/i,
    /\bwhere\s+1\s*=\s*1\b/i
  ];

  const checkForSuspiciousContent = (obj, objName = 'request') => {
    if (!obj || typeof obj !== 'object') return;

    for (let key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key) && typeof obj[key] === 'string') {
        for (let pattern of suspiciousPatterns) {
          if (pattern.test(obj[key])) {
            logger.error('Suspicious activity detected', {
              ip: req.ip,
              userAgent: req.get('User-Agent'),
              field: key,
              value: obj[key],
              pattern: pattern.toString(),
              source: objName,
              timestamp: new Date().toISOString()
            });

            return res.status(403).json({
              success: false,
              message: 'Suspicious activity detected. Request blocked.',
              errorType: 'SUSPICIOUS_ACTIVITY'
            });
          }
        }
      }
    }
  };

  // Check body (already sanitized)
  if (req.body) {
    const result = checkForSuspiciousContent(req.body, 'body');
    if (result) return result;
  }

  // Check original query params for suspicious patterns
  if (req.query) {
    const result = checkForSuspiciousContent(req.query, 'query');
    if (result) return result;
  }

  next();
};

// Export logger for use in other files
export { logger };
