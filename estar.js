const utils = require('./common/utils');
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
  
  // 로그아웃 (세션 기반 인증을 사용한다고 가정)
  router.post('/v2/token', async function(req, res) {
    try {
        
        logger.info(`api estar-call `);
        
        

        const method = `POST`;
        const url = `${estarConfig.url}/v2/token` ;
        const headers = { 'Accept': 'application/json',
                          'Content-Type': 'application/json'};
        
        //const { id, pwd, name, email, birthday } = req.body;

        const data = {
          credentials: {
            userName: `${estarConfig.AgentName}`,
            password: `${estarConfig.Password}`,
            domain: "EXT"
          }
        };
    
        const result = await utils.axiosCall(method, url, data, headers,null);
       // const result = await utils.makeApiCall(url,data) ;
        logger.info('estar API Response:', result); // 로그 추가
    
        
         logger.info(result.token);     // "OKKK"
         logger.info(result.idleTimeoutInMinutes);
      
        
        res.status(200).json(result);

        
      } catch (error) {
        //logger.error('Error fetching user data:', error);
        res.status(500).json({ error: 'Error fetching user data' });
      }
  });
  
  module.exports = router;