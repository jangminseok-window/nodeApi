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
       const xmlString = `<FareSearchRS><ErrorCode>0</ErrorCode><ErrorDesc>정상적인 데이터입니다.</ErrorDesc>
              <BKP1 SEQ="A70">
                BKP1- a70 
                   <BKP2  num="A70-1">
                     BKP2- a70-1 
                   </BKP2>
                   <BKP2  num="A70-2">
                     BKP2- a70-2 
                   </BKP2>
              </BKP1>
              <BKP1 SEQ="A71">
                BKP1- a70 ,
                <BKP2 num="A71-1">
                     BKP2- a71-1 
                 </BKP2>
             </BKP1>
        </FareSearchRS>`;
       
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

        Array.from(bkp1Elements).forEach((bkp1) => {
            const seq = bkp1.getAttribute('SEQ');
            const value = bkp1.childNodes[0].nodeValue.trim();
            
            const bkp1Item = {
                SEQ: seq,
                value: value,
                BKP2: []
            };

            // BKP2 태그들을 가져옵니다
            const bkp2Elements = bkp1.getElementsByTagName('BKP2');
            Array.from(bkp2Elements).forEach((bkp2) => {
                const bkp2Seq = bkp2.getAttribute('num');
                const bkp2Value = bkp2.textContent.trim();
                
                bkp1Item.BKP2.push({
                  num: bkp2Seq,
                  value: bkp2Value
                });
            });

            outStr.FareSearchRS.BKP1.push(bkp1Item);
        });
        

        const jsonResult = JSON.stringify(outStr, null, 2);

        res.status(200).json(JSON.parse(jsonResult));

        
      } catch (error) {
        logger.error('Error fetching user data:', error);
        res.status(500).json({ error: 'Error fetching user data' });
      }
  });
  
  module.exports = router;