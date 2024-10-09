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
  getRedisPool
      }  = require('./app-contex');


//각각의 router 정의하고 session 값등 req에 필요한 부분처리
const router = require('express').Router();
const { v4: uuidv4 } = require('uuid'); // UUID 생성을 위해 추가
const  redis = getRedisPool();

// 로그인
router.post('/login', async function(req, res) {
  try {
    const { userId, password } = req.body;

    // 입력 검증
    if (!userId || !password) {
      return res.status(400).json({ error: 'userId and password are required' });
    }
     
    const params = { id: userId, secretkey: my_secret_key };
    const query = mybatisMapper.getStatement('userMapper', 'selectById', params);
    
    const [rows] = await pool.execute(query, [userId, my_secret_key]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    logger.info(`User found: ${userId}`);
   
    // 비밀번호 검증
    const isMatch = await cryptoUtil.comparePassword(password, rows[0].pwd);
    
    if (isMatch) {
      // 비밀번호 일치 --> redis session 설정
      logger.info(`Login successful for user: ${userId}`);
      const uuid = uuidv4();

      const sessionData = JSON.stringify({
        userId: rows[0].id,
        name: rows[0].name,
        email: rows[0].email,
        birthday: rows[0].birthday,
      });
      
      await redis.set(uuid, sessionData);
      await redis.expire(uuid, serverConfig.sessionTimeout); 
    
      logger.info(`Session created for user: ${userId}, sessionId: ${uuid}`);

      res.status(200).json({
        message: 'Login successful',
        sessionId: uuid // 클라이언트에 UUID 전달
      });
    } else {
      // 비밀번호 불일치
      logger.warn(`Failed login attempt for user: ${userId}`);
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    logger.error(`Login error : ${error.message}`);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

// 로그아웃 (세션 기반 인증을 사용한다고 가정)
router.post('/logout', async function(req, res) {
  try {  
    const sessionVal = req.common.sessionVal;
    logger.info("sessionVal::" + sessionVal);
    // 입력 검증
    if (!sessionVal) {
      return res.status(400).json({ error: 'Session ID not set!' });
    }

    const result = await redis.del(sessionVal);
    if (result === 1) {
      console.log(`Session "${sessionVal}" has been successfully deleted.`);
      res.status(200).json({ message: 'Logout successful' });
    } else {
      console.log(`Session "${sessionVal}" does not exist.`);
      res.status(404).json({ error: 'Session not found' });
    }
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

module.exports = router;