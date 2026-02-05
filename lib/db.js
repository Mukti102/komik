import mysql from "mysql2/promise";

export const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "comic",
});

// Kode pengetesan koneksi
db.getConnection()
  .then((connection) => {
    console.log("✅ Database MySQL Terhubung!");
    connection.release();
  })
  .catch((err) => {
    console.error("❌ Koneksi Database Gagal:", err.message);
  });