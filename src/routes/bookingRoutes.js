const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const bookingController = require('../controllers/bookingController');

// Create a new booking
router.post('/create', authenticate, bookingController.createBooking);

// Get all bookings for current user
router.get('/user', authenticate, bookingController.getUserBookings);

// Cancel a booking
router.post('/cancel/:id', authenticate, bookingController.cancelBooking);

router.get('/all', authenticate, bookingController.getAllBookings); // Only if admin the bookings will be shown and status can be changed

//POST routes
router.post('/confirm/:id', bookingController.confirmBooking);
router.post('/reject/:id', bookingController.rejectBooking);
router.post('/cancel/:id', bookingController.cancelBooking);
module.exports = router;