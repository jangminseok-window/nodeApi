const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const db = require("./config/mysqlConn.js");
const logger = require('./log');

const conn = db.init();
const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, callback) {
      console.log(file);
      fs.existsSync("./uploads/") || fs.mkdirSync("./uploads/", { recursive: true });
      callback(null, "./uploads/");
    },
    filename: function (req, file, callback) {
      callback(null, file.originalname);
    },
  }),
});

// 게시글 목록 보기
router.get("/view", function (req, res) {
  logger.info("board - view action start!!");
  var sql = "SELECT * FROM board";
  conn.query(sql, function (err, result) {
    if (err) {
      console.log("Query error: " + err);
      res.status(500).json({ error: "Internal Server Error" });
    } else {
      res.json(result);
    }
  });
});

// 게시글 쓰기
router.post("/insert", upload.single("img"), function (req, res) {
  var body = req.body;
  var sql = "SELECT COUNT(*) + 1 AS bnum FROM board";
  conn.query(sql, function (err, result) {
    if (err) {
      console.log("Query error: " + err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    var sql = "INSERT INTO board (bnum, id, title, content, writedate) VALUES (?, ?, ?, ?, NOW())";
    var params = [result[0].bnum, body.id, body.title, body.content];
    conn.query(sql, params, function (err) {
      if (err) {
        console.log("Query error: " + err);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      if (req.file) {
        var sql = "INSERT INTO file (bnum, savefile, filetype, writedate) VALUES (?, ?, ?, NOW())";
        var params = [result[0].bnum, req.file.originalname, req.file.mimetype];
        conn.query(sql, params, function (err) {
          if (err) {
            console.log("Query error: " + err);
            return res.status(500).json({ error: "Internal Server Error" });
          }
          res.status(200).json({ message: "Post created successfully" });
        });
      } else {
        res.status(200).json({ message: "Post created successfully" });
      }
    });
  });
});

// 게시글 보기
router.get("/read/:bnum", function (req, res) {
  var sql = "SELECT * FROM board WHERE bnum = ?";
  conn.query(sql, [req.params.bnum], function (err, result) {
    if (err) {
      console.log("Query error: " + err);
      res.status(500).json({ error: "Internal Server Error" });
    } else {
      res.json(result);
    }
  });
});

// 게시글 수정
router.post("/update/:bnum", function (req, res) {
  var body = req.body;
  var sql = "UPDATE board SET id = ?, title = ?, content = ? WHERE bnum = ?";
  var params = [body.id, body.title, body.content, req.params.bnum];
  conn.query(sql, params, function (err) {
    if (err) {
      console.log("Query error: " + err);
      res.status(500).json({ error: "Internal Server Error" });
    } else {
      res.status(200).json({ message: "Post updated successfully" });
    }
  });
});

// 게시글 삭제
router.get("/delete/:bnum", function (req, res) {
  var sql = "DELETE FROM board WHERE bnum = ?";
  conn.query(sql, [req.params.bnum], function (err) {
    if (err) {
      console.log("Query error: " + err);
      res.status(500).json({ error: "Internal Server Error" });
    } else {
      res.status(200).json({ message: "Post deleted successfully" });
    }
  });
});

// 이미지 파일 불러오기
router.get("/img/:bnum", function (req, res) {
  var sql = "SELECT * FROM file WHERE bnum = ?";
  conn.query(sql, [req.params.bnum], function (err, result) {
    if (err) {
      console.log("Query error: " + err);
      res.status(500).json({ error: "Internal Server Error" });
    } else if (result.length != 0) {
      fs.readFile("uploads/" + result[0].savefile, function (err, data) {
        if (err) {
          console.log("File read error: " + err);
          res.status(500).json({ error: "Internal Server Error" });
        } else {
          res.writeHead(200, { "Content-Type": "image/jpeg" });
          res.end(data);
        }
      });
    } else {
      res.status(404).json({ error: "File not found" });
    }
  });
});

module.exports = router;