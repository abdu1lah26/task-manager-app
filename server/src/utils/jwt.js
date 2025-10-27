import jwt from 'jsonwebtoken';

/**
 * JWT (JSON Web Token) Utilities
 * 
 * WHAT IS JWT?
 * JWT is like a digital ID card. When user logs in, we give them a token.
 * They send this token with every request to prove who they are.
 * 
 * WHY USE JWT?
 * - Secure: Token is encrypted and can't be faked
 * - Stateless: Server doesn't need to remember logged-in users
 * - Expires: Token automatically becomes invalid after set time
 * 
 * SIMPLE ANALOGY:
 * Like a movie ticket with your name and seat number.
 * You show it each time you enter/exit the theater.
 */

/**
 * Generate JWT Token (Create the "ID card")
 * 
 * Called after successful login/register
 * Creates a token containing user info
 */
export const generateToken = (userId, email) => {
  // jwt.sign() creates the token
  return jwt.sign(
    // Payload: Information we want to store in token
    { userId, email },

    // Secret key: Used to encrypt/decrypt token (from .env file)
    process.env.JWT_SECRET,

    // Options: When should token expire?
    { expiresIn: process.env.JWT_EXPIRE } // Example: '7d' = 7 days
  );
};

/**
 * Verify JWT Token (Check if "ID card" is valid)
 * 
 * Called on protected routes
 * Checks if token is valid and not expired
 */
export const verifyToken = (token) => {
  try {
    // jwt.verify() decrypts and validates the token
    // Returns user info if valid
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    // If token is invalid or expired, return null
    return null;
  }
};