const express = require("express");
const router = express.Router();
const multer = require("multer");
const {
  postQuestion,
  getPdf,
  getFilteredQuestions,
  deleteQuestion,
} = require("../controllers/questionController");
const { deletePost } = require("../controllers/feedControllers");

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

router.post("/post", upload.single("pdf"), postQuestion);
router.get("/getpdf", getPdf);
router.post("/filteredQuestions", getFilteredQuestions);
router.delete("/delete/:qID", deleteQuestion);

module.exports = router;
