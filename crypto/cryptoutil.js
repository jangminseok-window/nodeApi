const bcrypt = require('bcryptjs');
const saltRounds = 10;

const cryptoUtil = {
  async hashPassword(password) {
    try {
      const salt = await bcrypt.genSalt(saltRounds);
      const hash = await bcrypt.hash(password, salt);
      return hash;
    } catch (error) {
      throw new Error('Error hashing password');
    }
  },

  async comparePassword(password, hash) {
    try {
      const result = await bcrypt.compare(password, hash);
      return result;
    } catch (error) {
      throw new Error('Error comparing passwords');
    }
  }
};

module.exports = cryptoUtil;