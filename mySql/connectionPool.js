const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'midstar',
  password: 'dlalwjd5',
  database: 'midstardb',
  connectionLimit: 10 // 최대 연결 수
});