const utils = require('./common/utils');
const estarUtil = require('./airline/estarUtil');
// router 는 제외하고 정의
const {  
    config,
    dbConfig,
    logger,
    express,
    db,
    cryptoUtil,
    mybatisMapper,
    my_secret_key,
    severConfig,
    pool,
    serverConfig,
    bodyParser,
    cors,
    getRedisPool,
    metaConfig,
    estarConfig
        }  = require('./app-contex');
  
  
  //각각의 router 정의하고 session 값등 req에 필요한 부분처리
  const router = require('express').Router();
  const { v4: uuidv4 } = require('uuid'); // UUID 생성을 위해 추가
  const  redis = getRedisPool();
  
  const { DOMParser } = require('xmldom');

  
  
  async function processCarriers(carriers) { // await는   asyn 함수가 다 끝날때까지 기다린다는 의미로 최상위에서만 사용가능함
    const tokenInfo = {};
    for (const carrier of carriers) {
        if(utils.safeCompareStrings("ZE", carrier)) {
            await estarUtil.getEstarToken(tokenInfo);
        }
    }
    return tokenInfo;
  }

  async function processSearch(searchObj) { 
    
    let result = null;

    for (const carrier of searchObj.carriers) {
        if(utils.safeCompareStrings("ZE", carrier)) {
          result = await estarUtil.getEstarSearch(searchObj);
        }
    }
    
    return result;
  }
  
  
  function convertApiFareSkdFormat(response,searchObj) { 
    
    let result = null;

    for (const carrier of searchObj.carriers) {
        if(utils.safeCompareStrings("ZE", carrier)) {
          result = estarUtil.convertEstarFareSkdInfo(response,searchObj);
        }
    }
    
    return result;
  }

  
  // 여정검색 
  router.post('/search', async function(req, res) {
    try {
        
        logger.info(`api air call-search `);
        const searchObj = {
          isRound,
          depCity,
          arrCity,
          depDate,
          arrDate,
          adultCnt,
          childCnt,
          infantCnt,
          carriers
      } = req.body;
     
      logger.info(`search -carriers- ${searchObj.carriers}`);
      
      

       if ( utils.isNullOrEmpty(searchObj.carriers)) {
        logger.error('carrier code is empty');
        throw new utils.CustomError("carrier code is empty","-1");
       }
      
      const tokenInfo = await processCarriers(searchObj.carriers);
     
       
      searchObj.tokenInfo = tokenInfo;
      const searchResult = await processSearch(searchObj);
      
      const result = convertApiFareSkdFormat(searchResult,searchObj);

        
       res.status(200).json(result);

        
      } catch (error) {
        logger.error('Error fetching user data:');
        res.status(500).json({ error: `${error}` });
      }
  });
  
  module.exports = router;