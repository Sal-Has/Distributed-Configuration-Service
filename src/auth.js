const jwt = require('jsonwebtoken');

function authMiddleware(requiredRole) {
  return (req, res, next) => {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({ error: 'Missing authorization token' });
    }

    try {
      const payload = jwt.verify(token, process.env.AUTH_SECRET);

      if (requiredRole && payload.role !== requiredRole) {
        return res.status(403).json({ error: 'Forbidden: insufficient role' });
      }

      req.user = payload;
      next();
    } catch (err) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  };
}

module.exports = {
  authMiddleware,
};
