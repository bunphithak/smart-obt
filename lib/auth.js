// JWT Authentication Utility
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production-2025';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'; // 7 days

/**
 * Generate JWT token
 * @param {Object} payload - User data to encode
 * @returns {string} JWT token
 */
export function generateToken(payload) {
  try {
    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
      issuer: 'smart-obt',
    });
    return token;
  } catch (error) {
    console.error('Error generating token:', error);
    throw new Error('Failed to generate token');
  }
}

/**
 * Verify and decode JWT token
 * @param {string} token - JWT token
 * @returns {Object} Decoded payload
 */
export function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'smart-obt',
    });
    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token has expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    }
    throw new Error('Token verification failed');
  }
}

/**
 * Extract token from Authorization header
 * @param {Object} req - Request object
 * @returns {string|null} Token or null
 */
export function extractToken(req) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return null;
  }

  // Support both "Bearer <token>" and just "<token>"
  const parts = authHeader.split(' ');
  if (parts.length === 2 && parts[0] === 'Bearer') {
    return parts[1];
  } else if (parts.length === 1) {
    return parts[0];
  }

  return null;
}

/**
 * Middleware to protect API routes
 * @param {Function} handler - API route handler
 * @returns {Function} Protected handler
 */
export function withAuth(handler, options = {}) {
  return async (req, res) => {
    try {
      const token = extractToken(req);

      if (!token) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
          message: 'No token provided'
        });
      }

      const decoded = verifyToken(token);

      // Check role if specified
      if (options.roles && !options.roles.includes(decoded.role)) {
        return res.status(403).json({
          success: false,
          error: 'Access denied',
          message: 'Insufficient permissions'
        });
      }

      // Attach user to request
      req.user = decoded;

      // Call the original handler
      return handler(req, res);
    } catch (error) {
      console.error('Auth middleware error:', error);
      return res.status(401).json({
        success: false,
        error: 'Authentication failed',
        message: error.message
      });
    }
  };
}

/**
 * Generate refresh token (longer expiration)
 * @param {Object} payload - User data to encode
 * @returns {string} Refresh token
 */
export function generateRefreshToken(payload) {
  try {
    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: '30d', // 30 days
      issuer: 'smart-obt-refresh',
    });
    return token;
  } catch (error) {
    console.error('Error generating refresh token:', error);
    throw new Error('Failed to generate refresh token');
  }
}

/**
 * Verify refresh token
 * @param {string} token - Refresh token
 * @returns {Object} Decoded payload
 */
export function verifyRefreshToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'smart-obt-refresh',
    });
    return decoded;
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
}
