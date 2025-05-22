const pool = require('../models/db');

// Create a new booking
exports.createBooking = async (req, res) => {
  const { vehicle_id, start_date, end_date, notes } = req.body;
  const user_id = req.user.id;

  try {
    // Calculate total price
    const { rows: vehicleRows } = await pool.query(
      'SELECT price_per_day FROM vehicles WHERE id = $1',
      [vehicle_id]
    );
    
    if (vehicleRows.length === 0) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    
    const price_per_day = parseFloat(vehicleRows[0].price_per_day);
    
    // Calculate days between dates
    const start = new Date(start_date);
    const end = new Date(end_date);
    const diffTime = Math.abs(end - start);
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (days <= 0) {
      return res.status(400).json({ error: 'Return date must be after pickup date' });
    }
    
    const total_price = days * price_per_day;
    
    // Check if vehicle is available for those dates
    const { rows: conflictRows } = await pool.query(
      `SELECT * FROM bookings 
       WHERE vehicle_id = $1 
       AND status = 'confirmed'
       AND ((start_date <= $2 AND end_date >= $2) 
          OR (start_date <= $3 AND end_date >= $3)
          OR (start_date >= $2 AND end_date <= $3))`,
      [vehicle_id, start_date, end_date]
    );
    
    if (conflictRows.length > 0) {
      return res.status(400).json({ error: 'Vehicle is already booked for these dates' });
    }
    
    // Create booking
    const { rows } = await pool.query(
      `INSERT INTO bookings 
       (user_id, vehicle_id, start_date, end_date, total_price, notes, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending', NOW())
       RETURNING id`,
      [user_id, vehicle_id, start_date, end_date, total_price, notes]
    );
    
    // Redirect to the user's bookings page
    res.redirect('/bookings');
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
};

// Get all bookings for the current user
exports.getUserBookings = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT b.*, v.brand, v.model, v.year, v.image_path 
       FROM bookings b
       JOIN vehicles v ON b.vehicle_id = v.id
       WHERE b.user_id = $1
       `,
      [req.user.id]
    );
    
    res.render('./customer/bookings', { bookings: rows });
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    res.status(500).send('Server error');
  }
};

// Cancel a booking
exports.cancelBooking = async (req, res) => {
  const booking_id = req.params.id;
  
  try {
    // Check if booking belongs to user
    const { rows } = await pool.query(
      'SELECT * FROM bookings WHERE id = $1 AND user_id = $2',
      [booking_id, req.user.id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found or unauthorized' });
    }
    
    // Update booking status
    await pool.query(
      "UPDATE bookings SET status = 'cancelled' WHERE id = $1",
      [booking_id]
    );
    
    res.redirect('/bookings');
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
};

// Get all bookings for admin rendering
exports.getAllBookings = async (req, res) => {
  try {
    const { rows } = await pool.query(`
     SELECT 
      b.*, 
      v.brand, v.model, v.year, v.price_per_day, v.image_path,
      u.first_name || ' ' || u.last_name AS customer_name,
      u.email, u.phone
    FROM bookings b
    JOIN vehicles v ON b.vehicle_id = v.id
    JOIN users u ON b.user_id = u.id
    ORDER BY b.created_at DESC;
    `);

    res.json(rows);
  } catch (error) {
    console.error('Error fetching all bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};

exports.confirmBooking = async (req, res) => {
  const booking_id = req.params.id;

  try {
    await pool.query(
      "UPDATE bookings SET status = 'confirmed' WHERE id = $1",
      [booking_id]
    );
    res.redirect('/adminbookings');
  } catch (error) {
    console.error('Error confirming booking:', error);
    res.status(500).json({ error: 'Failed to confirm booking' });
  }
};

exports.rejectBooking = async (req, res) => {
  const booking_id = req.params.id;

  try {
    await pool.query(
      "UPDATE bookings SET status = 'rejected' WHERE id = $1",
      [booking_id]
    );
    res.redirect('/adminbookings');
  } catch (error) {
    console.error('Error rejecting booking:', error);
    res.status(500).json({ error: 'Failed to reject booking' });
  }
};

exports.cancelBooking = async (req, res) => {
  const { id } = req.params;
  const userRole = req.user?.role || 'customer'; // default to customer if undefined

  try {
    await pool.query(`UPDATE bookings SET status = 'cancelled' WHERE id = $1`, [id]);

    if (userRole === 'admin') {
      res.redirect('/adminbookings');
    } else {
      res.redirect('/bookings');
    }
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).send('Server error');
  }
};
