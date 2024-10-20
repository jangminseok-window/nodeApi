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
   
  /**
 * 주어진 문자열이 null, undefined, 빈 문자열('') 또는 공백만 있는 문자열인지 체크합니다.
 * @param {string} str - 체크할 문자열
 * @returns {boolean} - 문자열이 null이거나 비어있으면 true, 그렇지 않으면 false
 */
function isNullOrEmpty(str) {
    // null 또는 undefined 체크
    if (str == null) {
        return true;
    }
    
    // 문자열 타입이 아닌 경우 false 반환
    if (typeof str !== 'string') {
        return false;
    }
    
    // 빈 문자열 또는 공백만 있는 문자열 체크
    return str.trim().length === 0;
}

/**
 * 두 문자열을 안전하게 비교하는 함수
 * @param {string} str1 - 첫 번째 문자열
 * @param {string} str2 - 두 번째 문자열
 * @returns {boolean} - 비교 결과 또는 null (문자열이 null/undefined인 경우)
 */
function safeCompareStrings(str1, str2) {
    // null 또는 undefined 체크
    if (str1 == null || str2 == null) {
        return false; // 둘 중 하나라도 null이면 null 반환
    }

    // 문자열 타입 체크
    if (typeof str1 !== 'string' || typeof str2 !== 'string') {
        return false; // 둘 중 하나라도 문자열이 아니면 null 반환
    }

    // 실제 문자열 비교
    return str1 === str2;
}


/**
 * 값이 null, undefined, 또는 "비어있음"인지 체크하는 함수
 * @param {*} value - 체크할 값
 * @returns {boolean} - 값이 null, undefined, 또는 "비어있음"이면 true, 그렇지 않으면 false
 */
function isNullOrEmpty(value) {
    // null 또는 undefined 체크
    if (value == null) {
        return true;
    }

    // 문자열 체크
    if (typeof value === 'string') {
        return value.trim().length === 0;
    }

    // 숫자 체크 (NaN 포함)
    if (typeof value === 'number') {
        return isNaN(value);
    }

    // 배열 체크
    if (Array.isArray(value)) {
        return value.length === 0;
    }

    // 객체 체크
    if (typeof value === 'object') {
        return Object.keys(value).length === 0;
    }

    // 기타 타입 (boolean, function 등)은 항상 값이 있다고 간주
    return false;
}



class CustomError extends Error {
    constructor(message, statusCode) {
      super(message);
      this.name = "CustomError";
      this.statusCode = statusCode;
    }
  }
  


// 여러 함수를 내보내기
module.exports = {
    formatDate,
    capitalizeString,
    axiosCall,
    makeApiCall,
    isNullOrEmpty,
    safeCompareStrings,
    isNullOrEmpty,
    CustomError
};