import { verifyToken } from '../utils/jwt.js';

/**
 * Authentication middleware - Validates JWT token from request header
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const token = authHeader.split(' ')[1];

    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};