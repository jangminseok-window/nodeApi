const originalMybatisMapper = require('mybatis-mapper');
const logger = require('./log');

const mybatisMapper = {
  createMapper: originalMybatisMapper.createMapper,
  getStatement: function(namespace, sql, param, format) {
    const query = originalMybatisMapper.getStatement(namespace, sql, param, format);
    if (logger.level === 'debug' || logger.level === 'trace') {
      logger.debug(`Executing query for ${namespace}.${sql}: ${query}`);
    }
    return query;
  }
};

module.exports = mybatisMapper;