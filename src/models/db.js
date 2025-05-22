const { Pool } = require("pg");

// Create pool
const pool = new Pool({
  user: "renter",
  host: "localhost",
  database: "carrental",
  password: "rental",
  port: 5432,
});

module.exports = pool;
