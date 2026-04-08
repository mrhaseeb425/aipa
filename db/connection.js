import mysql from "mysql2";
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "aipe_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const db = pool.promise();

db.getConnection()
  .then((connection) => {
    console.log("Database connected successfully");
    connection.release();
  })
  .catch((err) => {
    console.error("Database connection failed:", err.message);
  });

export default db;
