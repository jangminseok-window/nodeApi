const utils = require('../common/utils');
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
    axios,
    estarConfig
} = require('../app-contex');




  // 데이터 추출
  function convertEstarFareSkdInfo(response,searchObj) {
     
    
    
    try {
    
        const jsonData = response;
        const depArrCity = searchObj.depCity + "|" + searchObj.arrCity;

        

       
        if (utils.isNullOrEmpty(jsonData) || 
            utils.isNullOrEmpty(jsonData.results) || 
            utils.isNullOrEmpty(jsonData.results[0]) || 
            utils.isNullOrEmpty(jsonData.results[0].trips) || 
            utils.isNullOrEmpty(jsonData.results[0].trips[0]) || 
            utils.isNullOrEmpty(jsonData.results[0].trips[0].journeysAvailableByMarket) ||
            utils.isNullOrEmpty(jsonData.results[0].trips[0].journeysAvailableByMarket[`${depArrCity}`])) {
           
           //     console.log("Debugging: depArrCity =", depArrCity);
           //    console.log("Debugging: Available markets =", Object.keys(jsonData.results[0].trips[0].journeysAvailableByMarket));     

           logger.info("fare skd is empty!!");
           
           result.operatorCode = "-1";
           result.operatorMsg = "결과값이 없습니다.";
           return null; 
        }


     // 데이터 처리
     const trips = jsonData.results[0].trips[0];
     const journeys = trips.journeysAvailableByMarket[`${depArrCity}`];
     
     const airLines = journeys.flatMap(journey => {
         const segment = journey.segments[0];
         const leg = segment.legs[0];
     
         return journey.fares.map(fare => {
             
             const fareKey = fare.fareAvailabilityKey;
             const fareDetails = jsonData.faresAvailable[fareKey];
     
             // fareDetails가 null이거나 undefined인 경우를 체크
             if (!fareDetails) {
                 logger.error(`No fare details found for key: ${fareKey}`);
                 return null; // 또는 기본값을 반환하거나 다른 처리를 할 수 있습니다.
             }
             
             console.log(`Fare Key: ${fareKey}`);
                    console.log(`Total Fare: ${fareDetails.totals.fareTotal}`);
                    console.log(`Revenue Fare: ${fareDetails.totals.revenueTotal}`);
             const bookingClass = fareDetails.fares[0].classOfService;

        


            
             const classType = bookingClass === 'Y' ? 'Normal' : 'Discount';
             
             // 여기서 추가적인 처리를 할 수 있습니다.
             const seatCount = fare.details[0].availableCount;
             const isAvailable = seatCount > 0;
     
             // 예시: 운임 정보 계산
             const baseFare = 64900; // 실제 데이터에서 가져와야 합니다
             const fuelSurcharge = 8800;
             const adultTax = 4000;
             const childTax = 2000;
     
             const fareInfo = [
                 {
                     amount: baseFare,
                     fuel: fuelSurcharge,
                     paxType: "adult",
                     tax: adultTax,
                     total: baseFare + fuelSurcharge + adultTax
                 },
                 {
                     amount: baseFare,
                     fuel: fuelSurcharge,
                     paxType: "child",
                     tax: childTax,
                     total: baseFare + fuelSurcharge + childTax
                 },
                 {
                     amount: 0,
                     fuel: 0,
                     paxType: "infant",
                     tax: 0,
                     total: 0
                 }
             ];
     
             // 최종 객체 생성 및 반환
             return {
                 flight: segment.identifier.carrierCode,
                 flightNumber: parseInt(segment.identifier.identifier),
                 depCity: leg.designator.origin,
                 arrCity: leg.designator.destination,
                 depDate: leg.designator.departure,
                 arrDate: leg.designator.arrival,
                 bookingClass,
                 classType,
                 isAvailable,
                 isOpCar: false,
                 opCarrierCd: "",
                 resrvToken: fareKey,
                 orgFareRecKey: fareKey.slice(-3),
                 isReturn: false,
                 tasf: 1000,
                 childTasf: 1000,
                 infantTasf: 0,
                 seatCount,
                 fareInfo
             };
         });
     });
     
     const result = {
        carrierCode: "ZE",  // 첫 번째 항공편의 carrierCode를 사용
        totalRecord: airLines.length,
        errorCode: "200",
        errorMsg: "정상적인 DATA입니다",
        airLines: airLines
      };

       

        
      //  return airLines;
      return result;
 
     

      } catch (error) {
        logger.error('JSON 생성중 오류가 발생했습니다:');
    
        return null; 
      }
}


// 로그인 
  async function getEstarToken(tokenInfo) {
    try {
        
        
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
    
        
         logger.info(result.token);    
         logger.info(result.idleTimeoutInMinutes);
         
         tokenInfo.token = result.token;
         tokenInfo.idleTimeout = result.idleTimeoutInMinutes;
         tokenInfo.timestamp = new Date().toISOString();
        
        
      } catch (error) {
        logger.error('Error fetching user data:', error);
        tokenInfo.token = "";
      }
  };
  

  async function getEstarSearch(searchObj) {
    try {
        
        
        const method = `POST`;
        const url = `${estarConfig.url}/v4/availability/search/simple` ;
        const headers = { 'Authorization': `${searchObj.tokenInfo.token}`,
                          'Accept': 'application/json',
                          'Content-Type': 'application/json'};
          
          //const { id, pwd, name, email, birthday } = req.body;
          
        

          const data ={
            "origin": `${searchObj.depCity}`,
            "destination": `${searchObj.arrCity}`,
            "beginDate": `${searchObj.depDate}`,
            "agentName": `${estarConfig.AgentName}`,
            "passengers": {
                "residentCountry": "KR",
                "types": [
                    {
                        "count": 1,
                        "type": "ADT"
                    }
                ]
            },
            "codes": {
                "currencyCode": "KRW"
            },
            "taxesAndFees": "TaxesAndFees",
            "numberOfFaresPerJourney": 100
        };
      
          const result = await utils.axiosCall(method, url, data, headers,null);
         // const result = await utils.makeApiCall(url,data) ;
          //logger.info('estar API Response:', result); // 로그 추가
      
          
           //logger.info(result.result);     // "OKKK"
          // logger.info(result.currencyCode);
         return result;
        
      } catch (error) {
        logger.error('Error fetching user data:', error);
        return null; 
      }
  };

  
// 여러 함수를 내보내기
module.exports = {
   
    getEstarToken,
    getEstarSearch,
    convertEstarFareSkdInfo  
};