const express = require('express');
const mysql = require('mysql2');

const app = express();
app.use(express.json());

// MySQL connection pool 생성
const pool = mysql.createPool({
  host: 'localhost',
  user: 'midstar',
  password: 'dlalwjd5',
  database: 'midstardb',
  connectionLimit: 10
}).promise();

// 모든 사용자 조회
app.get('/users', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM users');
    res.json(rows);
  } catch (error) {
    console.error('쿼리 오류:', error);
    res.status(500).json({ error: '서버 오류' });
  }
});

// 특정 사용자 조회
app.get('/users/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    } else {
      res.json(rows[0]);
    }
  } catch (error) {
    console.error('쿼리 오류:', error);
    res.status(500).json({ error: '서버 오류' });
  }
});

// 새 사용자 추가
app.post('/users', async (req, res) => {
  const { name, email } = req.body;
  try {
    const [result] = await pool.query('INSERT INTO users (name, email) VALUES (?, ?)', [name, email]);
    res.status(201).json({ id: result.insertId, name, email });
  } catch (error) {
    console.error('쿼리 오류:', error);
    res.status(500).json({ error: '서버 오류' });
  }
});

// 사용자 정보 수정
app.put('/users/:id', async (req, res) => {
  const { name, email } = req.body;
  try {
    await pool.query('UPDATE users SET name = ?, email = ? WHERE id = ?', [name, email, req.params.id]);
    res.json({ id: req.params.id, name, email });
  } catch (error) {
    console.error('쿼리 오류:', error);
    res.status(500).json({ error: '서버 오류' });
  }
});

// 사용자 삭제
app.delete('/users/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ message: '사용자가 삭제되었습니다.' });
  } catch (error) {
    console.error('쿼리 오류:', error);
    res.status(500).json({ error: '서버 오류' });
  }
});

// 서버 시작
const port = 3000;
app.listen(port, () => {
  console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
});