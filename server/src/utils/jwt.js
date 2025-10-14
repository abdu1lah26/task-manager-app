import jwt from 'jsonwebtoken';

/**
 * Generate JWT token for user authentication
 * @param {number} userId - User ID
 * @param {string} email - User email
 * @param {string} role - User role
 * @returns {string} JWT token
 */
export const generateToken = (userId, email, role) => {
  return jwt.sign(
    { userId, email, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

/**
 * Verify JWT token validity
 * @param {string} token - JWT token to verify
 * @returns {Object|null} Decoded token payload or null if invalid
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return null;
  }
};