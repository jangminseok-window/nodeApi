// 전체 프레임워크에서 고정으로 사용되는 값설정 필요시 각 router-js에서 정의해서 사용
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
  router,
  serverConfig,
  bodyParser,
  cors,
  getRedisPool,
  app
 
  }  = require('./app-contex');

const { v4: uuidv4 } = require('uuid'); // UUID 생성을 위해 추가



logger.info(`apiApp Start---->`);

logger.info(`prometeus Start---->`);




const promClient = require('prom-client');
const collectDefaultMetrics = promClient.collectDefaultMetrics;
collectDefaultMetrics();

const  redis = getRedisPool();

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', promClient.register.contentType);
  res.end(await promClient.register.metrics());
}); // prometeus 설정 완료



//logger.info(`web DB Host: ${dbConfig.host}`);
//logger.info(`DB User: ${dbConfig.user}`);



app.use(async (req, res, next) => {
 //req에 공통으로 설정해야될 사항 설정
 try { 
  logger.info(`app user`);
  const sessionVal = req?.headers?.['x-session-id'] || null;

  logger.info(`sessionVal::` + sessionVal);

  req.common = {
      sessionVal: sessionVal
  };
    
  
  logger.info(`Request Body: ${JSON.stringify(req.body)}`);

  app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
      logger.error('Bad JSON', err);
      return res.status(400).send({ status: 400, message: "Bad JSON" });
    }
    next();
  });

   if (sessionVal) { // session 값이 있다면 시간 갱신
      logger.info(`sessionVal 1::` );
      const exists = await redis.exists(sessionVal);
      logger.info(`sessionVal 2::` );
      
      if (exists === 1) {
        const result = await redis.expire(sessionVal, serverConfig.sessionTimeout);
      } 
     
      logger.info(`sessionVal 3::` );
      
    }
  
  } catch (error) {
    logger.info(`sessionVal 4::` );
    logger.error(`Error updating session TTL: ${error}`);
  }    

  next();
});


logger.info(`sessionVal 갱신이후 :` );



//const boardRoutes = require('./board');
const authRoutes = require('./auth');
const userRoutes = require('./user');
const esbRoutes = require('./esbApi');
const estarRoutes = require('./estar');
//const voteRoutes = require('./vote');




app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// 라우트 연결
//app.use('/board', boardRoutes);
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/esb', esbRoutes);
app.use('/estar', estarRoutes);
//app.use('/vote', voteRoutes);


app.listen(serverConfig.port, () => {
  console.log(`Server running on port ${serverConfig.port}`);
});
