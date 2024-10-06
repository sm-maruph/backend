const express = require("express");
const router = express.Router();
const {
  getMarketItems,
  addPost,
  getProductInfo,
  updatePostStatusToSold,
  deletePost,
  getUserBookmarks,
  addBookmark,
  deleteBookmark,
  getAllUserPosts,
  updateProduct,
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

router.get("/getmarketitem", getMarketItems);
router.post("/addpost", upload.array("files", 10), addPost);
router.get("/getproductinfo", getProductInfo);
router.delete("/deletepost", deletePost);
router.put("/updatetosold", updatePostStatusToSold);
router.get("/getuserallpost", getAllUserPosts);
router.put("/updateproduct", upload.array("none"), updateProduct);

module.exports = router;
