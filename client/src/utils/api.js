import axios from 'axios';

/**
 * API Configuration File
 * 
 * This file creates a reusable axios instance for making HTTP requests to our backend.
 * Think of it as a helper that automatically handles common tasks like:
 * 1. Adding the base URL to every request
 * 2. Automatically attaching the authentication token
 * 3. Handling errors (like when token expires)
 */

// Create axios instance with default settings
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL, // Base URL from .env file
  headers: {
    'Content-Type': 'application/json', // Tell server we're sending JSON
  },
});

/**
 * REQUEST INTERCEPTOR
 * This runs BEFORE every API request we make
 * It automatically adds the JWT token to the request headers
 * So we don't have to manually add it every time we make an API call
 */
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage (saved during login)
    const token = localStorage.getItem('token');

    // If token exists, add it to request headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config; // Send the modified request
  },
  (error) => {
    // If something goes wrong before request is sent
    return Promise.reject(error);
  }
);

/**
 * RESPONSE INTERCEPTOR
 * This runs AFTER we get a response from the server
 * It checks if we got a 401 error (unauthorized)
 * If yes, it redirects user to login page
 */
api.interceptors.response.use(
  (response) => response, // If response is successful, just return it
  (error) => {
    // Check if error is 401 (Unauthorized - token expired or invalid)
    if (error.response?.status === 401) {
      // Get current page path
      const currentPath = window.location.pathname;

      // Check if we're already on login/register page
      const isAuthPage = currentPath === '/login' || currentPath === '/register';

      // Only redirect if we're NOT on login/register pages
      // (because login failures also return 401, and we don't want to redirect in that case)
      if (!isAuthPage) {
        // Clear expired token and user data
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        // Redirect to login page
        window.location.href = '/login';
      }
    }

    return Promise.reject(error); // Pass error to catch block
  }
);

// Export this configured axios instance to use throughout the app
export default api;