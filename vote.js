const express = require('express');
const router = express.Router();
const db = require('./config/mysqlConn.js');

const conn = db.init();

// 로그인
router.get('/insert', function(req, res) {
   console.log('voting call ');
  
});



module.exports = router;