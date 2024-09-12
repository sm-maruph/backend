const express = require("express");
const router = express.Router();
const multer = require("multer");
const {
  postQuestion,
  getPdf,
  deleteQuestion,
  updateQuestion,
} = require("../controllers/questionController");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./question/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix =
      Date.now() + "-" + Math.round(Math.random() * 10) + file.originalname;
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});

const upload = multer({ storage: storage });

router.post("/postquestion", upload.single("pdf"), postQuestion);
router.put("/updatequestion", updateQuestion);
router.post("/getquestion", getPdf);
router.post("/delete", deleteQuestion);

module.exports = router;
