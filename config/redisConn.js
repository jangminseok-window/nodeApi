
const Redis = require('ioredis');

const config = require('config');
const redisConfig = config.get('redis');

let redisPool = null;

function createRedisPool() {
  if (!redisPool) {
    redisPool = new Redis({
        host: redisConfig.host,
      port: 6379,
      password:  redisConfig.password,
      db: 0,
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      // 풀 설정
      poolSize: 10, // 최대 연결 수
      minIdle: 2,   // 최소 유지 연결 수
      // 기타 필요한 옵션들...
    });
 
    redisPool.on('error', (err) => {
      console.error('Redis pool error:', err);
    });

    redisPool.on('connect', () => {
      console.log('Connected to Redis');
    });
  }
  return redisPool;
}

module.exports = {
  getRedisPool: createRedisPool,
  initRedisPool: createRedisPool, // 초기화 함수 추가
};