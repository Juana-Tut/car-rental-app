const pool = require('./db');
const queries = require('./queries');

// Run table creation once on import
async function initTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS vehicles (
        id SERIAL PRIMARY KEY,
        brand VARCHAR(100) NOT NULL,
        model VARCHAR(100) NOT NULL,
        year INT NOT NULL,
        price_per_day NUMERIC(10, 2) NOT NULL,
        image_path TEXT,
        availability BOOLEAN DEFAULT TRUE
      );
    `);
    console.log("Vehicles table is ready.");
  } catch (error) {
    console.error("Error setting up the vehicles table:", error);
  }
}

// invokes 
initTable();
//Function to add a vehicle
const addVehicle = async (vehicle) => {
  const { brand, model, year, price_per_day, image_path, availability } = vehicle;
  const result = await pool.query(queries.insertVehicle, [
    brand,
    model,
    year,
    price_per_day,
    image_path,
    availability,
  ]);
  return result.rows[0];
};


// To retrieve all vehicles in admin view
const getAllVehicles = async () => {
  try {
    const result = await pool.query('SELECT * FROM vehicles ORDER BY id DESC');
    return result.rows;
  } catch (error) {
    console.error('Error getting all vehicles:', error);
    throw error;
  }
};
//Update vehicle data by id
const updateVehicle = async (id, vehicle) => {
  const { brand, model, year, price_per_day, image_path, availability } = vehicle;
  const result = await pool.query(queries.updateVehicle, [
    brand,
    model,
    year,
    price_per_day,
    image_path,
    availability,
    id,
  ]);
  return result.rowCount > 0;
};

//delete vehicle by id
const deleteVehicle = async (id) => {
  const result = await pool.query(queries.deleteVehicle, [id]);
  return result.rowCount > 0;
};
//Testing to get the path just for 1 vehicle by id
const getVehicleById = async (id) => {
  const result = await pool.query('SELECT * FROM vehicles WHERE id = $1', [id]);
  return result.rows[0]; // return a single vehicle
};

module.exports = {
  addVehicle,
  getAllVehicles,
  updateVehicle,
  deleteVehicle,
  getVehicleById
};
