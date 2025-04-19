const utils = require('./common/utils');
const estarUtil = require('./airline/estarUtil');
const asianaUtil = require('./airline/asianaUtil');
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

  async function processSearch(searchObj,carrier) { 
    
    let result = null;

   
    if(utils.safeCompareStrings("ZE", carrier)) {
          result = await estarUtil.getEstarSearch(searchObj);
     } else if(utils.safeCompareStrings("OZ", carrier)) {
          result = await asianaUtil.getOZSearch(searchObj);
     }
   
    
    return result;
  }
  
  
  async  function convertApiFareSkdFormat(response,searchObj,carrier) { 
    
    let result = null;

    
     if(utils.safeCompareStrings("ZE", carrier)) {
         result = estarUtil.convertEstarFareSkdInfo(response,searchObj);
     } else if(utils.safeCompareStrings("OZ", carrier)) {
         result = await asianaUtil.convertOZFareSkdInfo(response,searchObj);
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
      
      const finalResult = {
        operatorCode: "200",
        operatorMsg: "success",
        lines: [] 
      };
      
      const results = await Promise.all(searchObj.carriers.map(async (carrier) => {
        const searchResult = await processSearch(searchObj,carrier);
        const innerResult = await convertApiFareSkdFormat(searchResult, searchObj,carrier);
        finalResult.lines.push(innerResult);
        return   innerResult;
      }));
      
      
      results.flat()
      
     
      
     // logger.info("outout333-result:" ,result);
        
      res.status(200).json(finalResult);

        
      } catch (error) {
        logger.error('Error fetching user data:');
        res.status(500).json({ error: `${error}` });
      }
  });
  
  module.exports = router;