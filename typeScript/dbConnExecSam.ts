import pool from './mysqlConnSam';

async function executeQuery<T>(query: string, params: any[] = []): Promise<T> {
  const [rows] = await pool.execute(query, params);
  return rows as T;
}

// 사용 예시
interface User {
  id: number;
  name: string;
  email: string;
}

async function getUsers(): Promise<User[]> {
  const query = 'SELECT * FROM users';
  return executeQuery<User[]>(query);
}

async function getUserById(id: number): Promise<User | null> {
  const query = 'SELECT * FROM users WHERE id = ?';
  const users = await executeQuery<User[]>(query, [id]);
  return users[0] || null;
}

// 쿼리 실행
(async () => {
  try {
    const users = await getUsers();
    console.log('All users:', users);

    const user = await getUserById(1);
    console.log('User with id 1:', user);
  } catch (error) {
    console.error('Error:', error);
  }
})();