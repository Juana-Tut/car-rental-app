module.exports = {
  getUserByEmail: "SELECT * FROM users WHERE email = $1",
  insertUser:
    "INSERT INTO users(name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *",
  getVehicles: "SELECT * FROM vehicles WHERE availability = true",
  insertVehicle: `
  INSERT INTO vehicles (brand, model, year, price_per_day, image_path, availability)
  VALUES ($1, $2, $3, $4, $5, $6)
  RETURNING *;
`,
  updateVehicle: `
  UPDATE vehicles
  SET brand = $1, model = $2, year = $3, price_per_day = $4, image_path = $5, availability = $6
  WHERE id = $7
  RETURNING *;
`,
  deleteVehicle: "DELETE FROM vehicles WHERE id = $1",
  // updateVehicleAvailability:
  //   "UPDATE vehicles SET availability = $1 WHERE id = $2",
  insertBooking:
    "INSERT INTO bookings(user_id, vehicle_id, start_date, end_date, status) VALUES($1, $2, $3, $4, $5)",
  getUserBookings: "SELECT * FROM bookings WHERE user_id = $1",
  updateBookingStatus: "UPDATE bookings SET status = $1 WHERE id = $2",
  getAllBookings: "SELECT * FROM bookings",
};
