// utils.js
const xml2js = require('xml2js');

const {  
    config,
    dbConfig,
    logger,
    express,
    db,
    cryptoUtil,
    mybatisMapper,
    my_secret_key,
    pool,
    serverConfig,
    bodyParser,
    cors,
    getRedisPool,
    app,
    axios
} = require('../app-contex');

function formatDate(date) {
    return date.toISOString().split('T')[0];
}

function capitalizeString(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

async function axiosCall(method, url, data, headers, params) {
    try {
      const config = {
        method,
        url,
        headers,
        params
      };
      if (method.toLowerCase() !== 'get') {
        config.data = data;
      }
      const result = await axios(config);
      return result.data;
    } catch (error) {
      logger.error(`Error calling URL ${url}: ${error.message}`);
      throw error;
    }
 }

// 여러 함수를 내보내기
module.exports = {
    formatDate,
    capitalizeString,
    axiosCall
};