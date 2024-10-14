import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host:  "43.201.220.132",
  user: "midstar",
  password: "dlalwjd5",
  database: "midstardb",
  connectionLimit: 10
});

export default pool;
