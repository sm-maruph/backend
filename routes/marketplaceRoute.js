const express = require("express");
const router = express.Router();
const {
  
    getPosts
} = require("../controllers/marketPlaceControllers");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./marketplace/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix =
      Date.now() + "-" + Math.round(Math.random() * 10) + file.originalname;
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});

const upload = multer({ storage: storage });



router.get("/getposts", getPosts);




module.exports = router;