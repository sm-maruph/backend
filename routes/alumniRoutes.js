const express = require("express");
const router = express.Router();
const {
  getPosts,
  getStories,
  connectRequest,
  getConnectionCheck,
  getPendingConnectionCheck,
  getConnectedPosts,
  getPendingPosts,
  getConnectingPosts,
  addSuccessStories,
  postAcceptRequest,
  getAcceptCheck,
  postDeclineRequest,
  getConnectedAlumniList,


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
router.post("/connect", connectRequest);
router.get("/connectioncheck", getConnectionCheck);
router.get("/pendingconnectioncheck", getPendingConnectionCheck);
router.get("/acceptcheck", getAcceptCheck);
router.get("/getconnectedposts", getConnectedPosts);
router.get("/getpendingposts", getPendingPosts);
router.get("/getconnectingposts", getConnectingPosts);
router.post("/createstories",upload.array("images",10), addSuccessStories);
router.post("/postacceptrequest", postAcceptRequest);
router.post("/declinerequest", postDeclineRequest );
router.get("connectedalumnilist", getConnectedAlumniList)



module.exports = router;
