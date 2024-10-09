const cryptoUtil = require('./cryptoutil');

const userService = {
  async registerUser(username, password) {
    try {
      const hashedPassword = await cryptoUtil.hashPassword(password);
      // 여기서 사용자 정보를 데이터베이스에 저장
      console.log(`User ${username} registered with hashed password: ${hashedPassword}`);
    } catch (error) {
      console.error('Error registering user:', error);
    }
  },

  async loginUser(username, password) {
    try {
      // 데이터베이스에서 사용자의 해시된 비밀번호를 가져온다고 가정
      const storedHash = 'stored_hash_from_database';
      const isMatch = await cryptoUtil.comparePassword(password, storedHash);
      if (isMatch) {
        console.log('Login successful');
      } else {
        console.log('Invalid credentials');
      }
    } catch (error) {
      console.error('Error logging in:', error);
    }
  }
};

module.exports = userService;