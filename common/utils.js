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
      if (error.response) {
        logger.error(`Response status: ${error.response.status}`);
        logger.error(`Response data: ${JSON.stringify(error.response.data)}`);
      }
      throw error;
    }
  }
  
  async function makeApiCall(url,data) {
    try {
      const response = await axios.post(url, data, {
        headers: {
        
  'Accept': 'application/json',
  'Content-Type': 'application/json'
        }
      });

      
      
      console.log('응답 데이터:', response.data);
      return response.data;
    } catch (error) {
      console.error('API 호출 중 오류 발생:', error.message);
      if (error.response) {
        console.error('응답 상태:', error.response.status);
        console.error('응답 데이터:', error.response.data);
      }
      throw error;
    }
  }

// 여러 함수를 내보내기
module.exports = {
    formatDate,
    capitalizeString,
    axiosCall,
    makeApiCall
};