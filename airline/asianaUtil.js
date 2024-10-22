const utils = require('../common/utils');
const xml2js = require('xml2js');
const util = require('util');

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
    estarConfig,
    asianaConfig
} = require('../app-contex');

// xml2js.parseString을 Promise로 변환
const parseXml = util.promisify(xml2js.parseString);

async function parseXmlData(xmlData) {
    try {
      const result = await parseXml(xmlData);
      return result;
    } catch (error) {
      console.error('XML 파싱 오류:', error);
      throw error;
    }
  }


  async function convertOZFareSkdInfo(response, searchObj) {
  
  
    try {
      const xmlData = response;
      const parsedResult = await parseXmlData(xmlData);
      
      const dfFareOutput = parsedResult.df_fare_output;
      const classMainInfoList = dfFareOutput.class_main_info_t;
      const replyAvailFare = dfFareOutput.reply_avail_fare_t[0];
  
      const airLines = replyAvailFare.avail_fare_set_t.flatMap(availFareSet => {
        const segFare = availFareSet.seg_fare_t[0];
        
        return segFare.class_detail_t.map(classDetail => {
          return {
            flight: segFare.car_code[0],
            flightNumber: parseInt(segFare.main_flt[0]),
            depCity: segFare.dep_city[0],
            arrCity: segFare.arr_city[0],
            depDate: segFare.dep_date_time[0],
            arrDate: segFare.arr_date_time[0],
            bookingClass: classDetail.class[0],
            seatCount: parseInt(classDetail.no_of_avail_seat[0]),
            fareInfo: [
              {
                amount: parseInt(classDetail.fare[0]),
                fuel: parseInt(segFare.fuel_chg[0]),
                paxType: "adult",
                tax: parseInt(segFare.air_tax[0]),
                total: parseInt(classDetail.fare[0]) + parseInt(segFare.fuel_chg[0]) + parseInt(segFare.air_tax[0])
              }
            ]
          };
        });
      });
  
      const result = {
        carrierCode: "OZ",  // 첫 번째 항공편의 carrierCode를 사용
        totalRecord: airLines.length,
        errorCode: "200",
        errorMsg: "정상적인 DATA입니다",
        airLines: airLines
      };
       
     // logger.info("result:", result);
      //return result;
      return result;
      
    } catch (error) {
      console.error('JSON 생성중 오류가 발생했습니다:', error);
      result.operatorCode = "-1";
      result.operatorMsg = error.message || "알 수 없는 오류가 발생했습니다";
      return null;
    }
  }

  async function getOZSearch(searchObj) {
    try {
        
        
        const method = `GET`;
        const url = `${asianaConfig.url}/javaDomfltavskdfare.agw` ;
        const headers = { 'Accept': 'application/json',
                          'Content-Type': 'application/json'};
          
          //const { id, pwd, name, email, birthday } = req.body;
        
        const depdate =   searchObj.depDate.split("T")[0].replaceAll("-","");
        const params ={
            "AgtID": `${asianaConfig.AgtID}`,
            "OriginLocation0": `${searchObj.depCity}`,
            "DestinationLocation0": `${searchObj.arrCity}`,
            "DepartureDate0": `${depdate}`
        };
      
         const result = await utils.axiosCall(method, url, null, headers,params);
        
          
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

    getOZSearch,
    convertOZFareSkdInfo  
};