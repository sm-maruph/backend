const express = require("express");
const router = express.Router();
const {
  getPosts,
  getStories,

} = require("../controllers/alumniController");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./alumni/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix =
      Date.now() + "-" + Math.round(Math.random() * 10) + file.originalname;
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});

const upload = multer({ storage: storage });

router.get("/getposts", getPosts);
router.get("/getstories", getStories);


module.exports = router;
