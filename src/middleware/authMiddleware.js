const jwt = require('jsonwebtoken');
const pool = require('../models/db'); // Import the database connection

exports.authenticate = async (req, res, next) => {
  // Check if we have a token in the cookie
  const token = req.cookies.token;
  if (!token) {
    return res.redirect('/login');
  }
  
  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Fetch complete user information from database
    const { rows } = await pool.query(
      'SELECT * FROM users WHERE id = $1', 
      [decoded.id]
    );
    
    if (rows.length === 0) {
      // User not found in database
      res.clearCookie('token');
      return res.redirect('/login');
    }
    
    // Set the complete user object in req
    req.user = rows[0];
    
    // Continue to the next middleware/route handler
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.clearCookie('token');
    return res.redirect('/login');
  }
};


// Role-based authorization middleware
exports.authorizeRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.redirect('/login');
    }
    
    if (typeof roles === 'string') {
      roles = [roles];
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).render('error', { 
        message: 'Access Denied',
        error: { status: 403, stack: 'You do not have permission to access this page.' }
      });
    }
    
    next();
  };
};

// Redirect logged in users away from login/register pages
exports.redirectIfAuthenticated = (req, res, next) => {
  const token = req.cookies.token;
  
  if (!token) {
    return next();
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // If user is already logged in, redirect based on role
    if (decoded.role === 'admin') {
      return res.redirect('/adminmain');
    } else {
      return res.redirect('/dashboard');
    }
  } catch (error) {
    // If token is invalid, clear it and continue
    res.clearCookie('token');
    next();
  }
};
