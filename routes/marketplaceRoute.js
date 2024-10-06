const express = require("express");
const router = express.Router();
const {
  getMarketItems,
  addPost,
  getProductInfo,
  updatePostStatusToSold,
  updatePost,
  deletePost,
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
router.put("/updatepost", upload.single("image"), updatePost);
router.delete("/deletepost", deletePost);
router.put("/updatetosold", updatePostStatusToSold);

module.exports = router;
