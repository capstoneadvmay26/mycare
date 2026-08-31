const jwt = require('jsonwebtoken');

/**
 * Middleware to verify authorization tokens and protect routes.
 */
const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Check if Bearer token is provided in headers
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verify JWT secret and decode payload
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    req.user = decoded; // Attach user payload (id, role) to request
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

module.exports = requireAuth;