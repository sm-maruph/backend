const express = require("express");
const router = express.Router();
const {
  feedPost,
  getPosts,
  feedLikes,
  getLikes,
  feedComment,
  getComments,
  commentLikes,
  getCommentLikes,
  deletePost,
  editPost,
  updatePost,
  deleteComment,
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

//post
router.post("/post", upload.array("files", 10), feedPost);
//edit a individual Post
router.put("/update/:postId", updatePost);
router.get("/edit/:postId", editPost);

router.post("/like", feedLikes);
router.post("/comment/:postId", upload.array("files", 10), feedComment);
router.post("/commentlikes/:commentId", commentLikes);
router.get("/getposts", getPosts);
router.get("/getLikes/:postId", getLikes);
router.get("/getcomments/:postId", getComments);
router.get("/getcommentlikes/:commentId", getCommentLikes);

// Delteing

router.delete("/deletepost/:postId", deletePost);
router.delete("/deletecomment/:commentId", deleteComment);
module.exports = router;
