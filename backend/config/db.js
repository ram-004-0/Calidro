const mysql = require("mysql2/promise");
require("dotenv").config();

// If these values are missing, log them so we can see which one is undefined
if (!process.env.DB_HOST || !process.env.DB_PORT) {
  console.error("❌ MISSING DATABASE ENVIRONMENT VARIABLES!");
}

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT) || 3306, // Ensure it's a number
  ssl: { rejectUnauthorized: false },
});

module.exports = pool;
