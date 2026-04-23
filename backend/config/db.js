const mysql = require("mysql2/promise");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: 24097,
  ssl: { rejectUnauthorized: false },
});
console.log("DEBUG: Attempting DB connect with:", {
  host: process.env.DB_HOST,
  port: process.env.PORT,
  user: process.env.DB_USER,
  hasPassword: !!process.env.DB_PASSWORD,
});
module.exports = pool;
