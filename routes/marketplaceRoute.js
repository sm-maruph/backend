const express = require("express");
const router = express.Router();
const {
  getPosts,
  addPost,
  getMyListings,
  updatePost,
  deletePost,
  getContacts,
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
router.post("/addpost", upload.array("files", 10), addPost);
router.get("/getmylistings", getMyListings);
router.put("/updatepost", upload.single("image"), updatePost);
router.delete("/deletepost/:id", deletePost);
router.get("/getcontacts/:uid", getContacts);

module.exports = router;
