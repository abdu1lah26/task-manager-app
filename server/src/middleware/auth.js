import { verifyToken } from '../utils/jwt.js';

export const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'No token provided' 
      });
    }

    // Extract token
    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid or expired token' 
      });
    }

    // Attach user info to request
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ 
      success: false, 
      message: 'Authentication failed' 
    });
  }
};