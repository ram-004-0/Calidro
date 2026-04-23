const mysql = require("mysql2/promise");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.PORT) || 3306, // Ensure it's a number
  ssl: { rejectUnauthorized: false },
});
// Add this temporarily above the pool creation
console.log("DEBUG: Attempting DB connect with:", {
  host: process.env.DB_HOST,
  port: process.env.PORT,
  user: process.env.DB_USER,
  // DO NOT log the password, but log if it exists
  hasPassword: !!process.env.DB_PASSWORD,
});
module.exports = pool;
