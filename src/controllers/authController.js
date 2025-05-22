const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { findUserByEmail, createUser } = require('../models/userModel');

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).render('login', { error: 'Invalid credentials' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).render('login', { error: 'Invalid credentials'});
    }

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    // Store token in a cookie
    res.cookie('token', token, { httpOnly: true });
    
    // Store user info in session
    req.session = req.session || {};
    req.session.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      first_name: user.first_name,
      last_name: user.last_name
    };

    // Redirect based on role
    if (user.role === 'admin') {
      return res.redirect('/adminmain');
    } else {
      return res.redirect('/dashboard');
    }

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).render('login', { error: 'Server error during login.'});
  }
};

exports.register = async (req, res) => {
  try {
    const { role, first_name, last_name, phone, email, password } = req.body;

    // Basic validation
    if (!role || !['admin', 'customer'].includes(role)) {
      return res.status(400).render('register', { error: 'Invalid or missing user role.' });
    }
    if (!first_name || !last_name || !phone || !email || !password) {
      return res.status(400).render('register', { error: 'All fields are required.' });
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).render('register', { error: 'Email already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await createUser({
      role,
      first_name,
      last_name,
      phone,
      email,
      password: hashedPassword
    });

    // Redirect to login with success message
    res.redirect('/login?success=true');
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).render('register', { error: 'Server error during registration.' });
  }
};

// Logout functionality
exports.logout = (req, res) => {
  // Clear the cookie
  res.clearCookie('token');
  
  // Clear the session
  if (req.session) {
    req.session.destroy();
  }
  
  // Redirect to home page
  res.redirect('/');
};