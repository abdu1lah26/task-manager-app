import { verifyToken } from '../utils/jwt.js';

/**
 * Authentication Middleware
 * 
 * WHAT IS MIDDLEWARE?
 * Middleware is code that runs BETWEEN receiving a request and sending a response.
 * Think of it like a security guard who checks your ID before letting you in.
 * 
 * WHAT THIS DOES:
 * 1. Checks if user sent a valid JWT token
 * 2. If yes, allows access to protected routes
 * 3. If no, sends 401 error (unauthorized)
 * 
 * HOW TO USE:
 * Add this to routes you want to protect:
 * router.get('/protected-route', authenticate, yourController);
 */
export const authenticate = async (req, res, next) => {
  try {
    // Step 1: Get the Authorization header from request
    // Format should be: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    const authHeader = req.headers.authorization;

    // Step 2: Check if header exists and starts with "Bearer "
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    // Step 3: Extract token (remove "Bearer " part)
    // Example: "Bearer abc123" becomes "abc123"
    const token = authHeader.split(' ')[1];

    // Step 4: Verify if token is valid and not expired
    const decoded = verifyToken(token);

    // Step 5: If token is invalid or expired
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    // Step 6: Token is valid! Attach user info to request
    // Now other functions can access req.user
    req.user = decoded;

    // Step 7: Continue to next function (the actual route handler)
    next();
  } catch (err) {
    // If anything goes wrong, send error
    res.status(401).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};