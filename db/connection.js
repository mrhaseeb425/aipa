const mysql = require("mysql2");

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "mydb",
});

db.getConnection((err, connection) => {
  if (err) {
    console.error("Database connection failed", err);
  } else {
    console.log("Database connected successfully");
    connection.release(); // connection free karo pool me
  }
});

module.exports = db;
