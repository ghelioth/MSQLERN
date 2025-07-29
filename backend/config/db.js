const mysql = require("mysql2");
require("dotenv").config({ path: "./config/.env" });

const db = mysql.createPool({
  host: process.env.DB_HOST_NAME,
  user: process.env.DB_USER_NAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

console.log("Connected to MySQL Server ");

// db.getConnection()
//   .then((connection) => {

//     connection.release();
//   })
//   .catch((err) => {
//     console.error("Failed to connect to database ", err);
//   });

module.exports = db;
