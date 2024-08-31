const express = require("express");
const router = express.Router();
const multer = require("multer");
const { getQuestions } = require("../controllers/questionControllers");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./questionpdf/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix =
      Date.now() + "-" + Math.round(Math.random() * 10) + file.originalname;
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});
const upload = multer({ storage: storage });

router.get("/getquestions/:input", getQuestions);

module.exports = router;
