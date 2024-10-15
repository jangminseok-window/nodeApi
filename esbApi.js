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
    metaConfig
        }  = require('./app-contex');
  
  
  //각각의 router 정의하고 session 값등 req에 필요한 부분처리
  const router = require('express').Router();
  const { v4: uuidv4 } = require('uuid'); // UUID 생성을 위해 추가
  const  redis = getRedisPool();
  
  const { DOMParser } = require('xmldom');
  
  // 로그아웃 (세션 기반 인증을 사용한다고 가정)
  router.get('/metasearch', async function(req, res) {
    try {
        
        logger.info(`api esb-metasearch `);
     
        const method = `${metaConfig.method}`;
        const url = `${metaConfig.url}`;
        const headers = { 'Content-Type': 'application/json'};
        //

        const params = { 
            mSiteInd : 'P',
            trip : 'RT',
            dep0 : 'ICN',
            arr0 : 'KIX',
            depdate0 : '20241115',
            retdate  : '20241122',
            adtyn    : 'false',
            adt      : 1,
            chd      : 0,
            inf      : 0,
            comp     : 'Y',
            origin   : 'LOTTETOUR',
            siteInd  : 'NV',
            viayn    : 'N'

        }; 
    
       // const result = await utils.axiosCall(method, url, null, headers, params);
    
        //logger.info('API Response:', result); // 로그 추가
    
        
       // logger.info(result.result);     // "OKKK"
       // logger.info(result.RTime);      // "2.441SEC"
       // logger.info(result.ErrorDesc);  // "Successful"
       // logger.info(result.ErrorCode);  // "0"
        
        //const xmlString = result.result;
       const xmlString = `{
            "FareSearchRS": {
                "ErrorCode": "0",
                "ErrorDesc": "정상적인 데이터입니다.",
                "BKP1": [
                    {
                        "SEQ": "A70",
                        "value": "BKP1- a70",
                        "BKP-IN": [
                                            {
                                                "SEQ": "A70",
                                                "value": "BKPIN- a70"
                                            },
                                            {
                                                "SEQ": "A70",
                                                "value": "BKPIN- a710"
                                            }
                                        ]
                    },
                    {
                        "SEQ": "A71",
                        "value": "BKP1- a71",
                        "BKP-IN": [
                                            {
                                                "SEQ": "A71",
                                                "value": "BKPIN- a711"
                                            },
                                            {
                                                "SEQ": "A72",
                                                "value": "BKPIN- a710"
                                            }
                                        ]

                    }
                ]
            }
        }`;
            
       // DOMParser 인스턴스 생성
        const parser = new DOMParser();

        // XML 문자열을 파싱하여 XMLDocument 객체 생성
        const xmlDoc = parser.parseFromString(xmlString, "text/xml");

        const errorCodeElement = xmlDoc.getElementsByTagName('ErrorCode')[0];
        const errorCode = errorCodeElement ? errorCodeElement.textContent : 'Not found';
        const errorDescElement = xmlDoc.getElementsByTagName('ErrorDesc')[0];
        const errorDesc = errorDescElement ? errorDescElement.textContent : 'Not found';
       
        
        logger.info('Error Code:', errorCode);
        
         // JavaScript 객체 생성
         const outStr = {
            FareSearchRS: {
                ErrorCode: errorCode,
                ErrorDesc: errorDesc,
                BKP1: []
            }
        };

        
       
       

        // BKP1 태그들을 모두 가져옵니다
        const bkp1Elements = xmlDoc.getElementsByTagName('BKP1');
        // 각 BKP1 태그의 값과 속성을 출력합니다
        
      
        Array.from(bkp1Elements).forEach((bkp1, index) => {
            const seq = bkp1.getAttribute('SEQ');
            const value = bkp1.textContent.trim();
            
            outStr.FareSearchRS.BKP1.push({
                SEQ: seq,
                value: value
            });
            /*console.log(`BKP1 #${index + 1}:`);
            console.log(`  SEQ: ${seq}`);
            console.log(`  Value: ${value}`);
            console.log('---');*/
        }); 
        

        const jsonResult = JSON.stringify(outStr, null, 2);

        res.status(200).json(JSON.parse(jsonResult));

        
      } catch (error) {
        logger.error('Error fetching user data:', error);
        res.status(500).json({ error: 'Error fetching user data' });
      }
  });
  
  module.exports = router;