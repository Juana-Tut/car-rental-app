// Role-based access control
function authorizeRole(role) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).send('Forbidden: Admins only');
    }
    next();
  };
}

module.exports = authorizeRole;
