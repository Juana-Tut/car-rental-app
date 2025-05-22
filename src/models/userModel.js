const db = require('./db');

// Create the users table if it doesn't exist
const createUserTable = async () => {
  const query = `
    
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      role VARCHAR(10) NOT NULL CHECK (role IN ('admin', 'customer')),
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NOT NULL,
      phone VARCHAR(20) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await db.query(query);
};

const createUser = async ({ role, first_name, last_name, phone, email, password }) => {
  const result = await db.query(
    `INSERT INTO users (role, first_name, last_name, phone, email, password)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [role, first_name, last_name, phone, email, password]
  );
  return result.rows[0];
};

const findUserByEmail = async (email) => {
  const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0];
};

module.exports = {
  createUserTable,
  createUser,
  findUserByEmail
};
