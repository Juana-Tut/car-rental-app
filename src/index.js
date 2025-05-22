// --------- index.js ---------
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');

const pool = require('./models/db');
const queries = require('./models/queries');
const { createUserTable } = require('./models/userModel');
const { createBookingTable } = require('./models/booking');

// Route files
const authRoutes = require('./routes/authRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const bookingRoutes = require('./routes/bookingRoutes');


// Import controller
const vehicleController = require('./controllers/vehicleController');

// Import middleware
const { authenticate, authorizeRole, redirectIfAuthenticated } = require('./middleware/authMiddleware');

const app = express();
const methodOverride = require('method-override');
app.use(methodOverride('_method'));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Add cookie parser
app.use(express.static(path.join(__dirname, 'public')));

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'rAnd0m$tr1ngW1thL0ts0fCh@r@ct3rs',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 1000 // 1 hour
  }
}));

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Public page routes
app.get('/', (req, res) => res.render('home', { title: 'Home' }));
app.get('/login', redirectIfAuthenticated, (req, res) => {
  const success = req.query.success === 'true';
  res.render('login', { success, error: null });
});
app.get('/register', redirectIfAuthenticated, (req, res) => res.render('register', { error: null }));

// Protected routes - Admin
app.get('/adminmain', authenticate, authorizeRole('admin'), (req, res) => {
  res.render('./admin/admin', { user: req.user });
});
app.get('/adminvehicle', authenticate, authorizeRole('admin'), (req, res) => {
  res.render('./admin/allvehicles', { user: req.user });
});
// admin bookings rendering
app.get('/adminbookings', authenticate, authorizeRole('admin'), (req, res) =>{
  res.render('./admin/bookings', { user: req.user });
});
// Protected routes - Customer
app.get('/dashboard', authenticate, authorizeRole('customer'), (req, res) => {
  res.render('./customer/dashboard', { user: req.user });
});
// Add this after your existing admin routes
app.get('/admin/users', authenticate, authorizeRole('admin'), async (req, res) => {
  try {
    const pool = require('./models/db');
    const query = `
      SELECT 
        id, 
        first_name, 
        last_name,
        email, 
        role, 
        created_at,
        (SELECT COUNT(*) FROM bookings WHERE user_id = users.id) as booking_count
      FROM users 
      WHERE role = 'customer'
      
    `;
    
    const result = await pool.query(query);
    res.render('./admin/users', { 
      users: result.rows,
      user: req.user 
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).render('error', {
      message: 'Error fetching users',
      error: { status: 500, stack: error.message }
    });
  }
});

app.get('/admin/users/:userId', authenticate, authorizeRole('admin'), async (req, res) => {
  try {
    const pool = require('./models/db');
    const userId = req.params.userId;
    
    // Get user details
    const userQuery = `
      SELECT id, first_name, last_name, email, role, created_at
      FROM users 
      WHERE id = $1 AND role = 'customer'
    `;
    const userResult = await pool.query(userQuery, [userId]);
    
    if (userResult.rows.length === 0) {
      return res.status(404).render('error', {
        message: 'User not found',
        error: { status: 404, stack: 'The requested user does not exist.' }
      });
    }
    
    // Get user's bookings with vehicle details
    const bookingsQuery = `
      SELECT 
        b.id,
        b.start_date,
        b.end_date,
        b.total_price,
        b.status,
        b.created_at,
        v.model,
        v.year,
        v.brand
      FROM bookings b
      JOIN vehicles v ON b.vehicle_id = v.id
      WHERE b.user_id = $1
      ORDER BY b.created_at DESC
    `;
    const bookingsResult = await pool.query(bookingsQuery, [userId]);
    
    res.render('./admin/user-details', {
      selectedUser: userResult.rows[0],
      bookings: bookingsResult.rows,
      user: req.user
    });
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).render('error', {
      message: 'Error fetching user details',
      error: { status: 500, stack: error.message }
    });
  }
});

// API Routes
app.use('/vehicles', vehicleRoutes); // client side
app.use('/api/auth', authRoutes);


// Make sure authenticate middleware is applied at the route level instead
// This ensures we don't apply it to routes that don't exist
app.use('/api/bookings', bookingRoutes);

app.get('/bookings', authenticate, authorizeRole('customer'), (req, res) => {
  res.redirect('/api/bookings/user');
});

//Customer JSON endpoints
app.get('/api/public/vehicles', vehicleController.getVehiclesJSON); 
// Admin JSON endpoints 
app.get('/api/vehicles', authenticate, authorizeRole('admin'), vehicleController.getVehiclesJSON);

// Error handling middleware
app.use((req, res, next) => {
  res.status(404).render('error', {
    message: 'Page Not Found',
    error: { status: 404, stack: 'The requested page does not exist.' }
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).render('error', {
    message: err.message || 'Something went wrong',
    error: { status: err.status || 500, stack: process.env.NODE_ENV === 'development' ? err.stack : '' }
  });
});

// Start server
async function startServer() {
  try {
    await createUserTable();
    // await createBookingTable();
    console.log('All tables ready');

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Error initializing DB:', err);
  }
}

startServer();
