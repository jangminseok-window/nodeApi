const bodyParser = require('body-parser');
const cors = require('cors');
const config = require('config');
const dbConfig = config.get('db');
const metaConfig = config.get('meta');
const estarConfig = config.get('estar');
const asianaConfig = config.get('asiana');



const redisConfig = config.get('redis');
const serverConfig = config.get('server');
const logger = require('./log');
const express = require('express');
const db = require('./config/mysqlConn');
const cryptoUtil = require('./crypto/cryptoutil');
const mybatisMapper = require('./mybatis-wrapper');
const axios = require('axios');

const my_secret_key = dbConfig.secretkey;
const pool = db.init();

const router = express.Router();

mybatisMapper.createMapper(['./sql/user.xml']);

const { initRedisPool, getRedisPool } = require('./config/redisConn');

initRedisPool();

const app = express();
app.set('view engine', 'ejs');
app.set('views', './views');

module.exports = {
  config,
  dbConfig,
  metaConfig,
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
  app,
  axios,
  estarConfig,
  asianaConfig

};