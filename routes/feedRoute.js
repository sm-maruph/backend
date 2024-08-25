const express = require("express");
const router = express.Router();
const {
  feedPost,
  getPosts,
  feedLikes,
  getLikes,
  feedComment,
} = require("../controllers/feedControllers");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./feed/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix =
      Date.now() + "-" + Math.round(Math.random() * 10) + file.originalname;
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});

const upload = multer({ storage: storage });

router.post("/post", upload.array("files", 10), feedPost);
router.post("/like", feedLikes);
router.post("/comment/:postId", upload.single("image"), feedComment);
router.get("/getposts", getPosts);
router.get("/getLikes/:postId", getLikes);

module.exports = router;
