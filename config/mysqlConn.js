const config = require('config');
const dbConfig = config.get('db');
const mysql = require("mysql2/promise");

const db_info = {
  host: dbConfig.host,
  port: "3306",
  user: dbConfig.user,
  password: dbConfig.password,
  database: dbConfig.database,
  connectionLimit: 10 // 연결 풀의 최대 연결 수
};

let pool;

module.exports = {
  init: function () {
    if (!pool) {
      pool = mysql.createPool(db_info);
    }
    return pool;
  },
  connect: async function () {
    try {
      const connection = await pool.getConnection();
      console.log("MySQL pool connected successfully!");
      connection.release();
      return pool;
    } catch (err) {
      console.error("MySQL pool connection error:", err);
      throw err;
    }
  }
};