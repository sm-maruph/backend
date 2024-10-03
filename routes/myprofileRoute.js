const express = require("express");
const router = express.Router();
const {
  getUserProfilePicture,
  updateUserProfilePicture,
  getUserInfo,
  updateCV,
  deleteUserCV,
  getUserJobInfo,
  addUserJobInfo,
  deleteUserJobInfo,
  addUserSkill,
  getUserSkills,
  removeUserSkill,
  getUserDetails,
} = require("../controllers/myprofileControllers");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix =
      Date.now() + "-" + Math.round(Math.random() * 10) + file.originalname;
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});

const upload = multer({ storage: storage });

//post
router.get("/getprofile", getUserProfilePicture);
router.post(
  "/setprofile",
  upload.single("profilePicture"),
  updateUserProfilePicture
);
// router.post("/uploadCV", updateUserCv);
router.post("/uploadcv", upload.single("CV"), updateCV);
router.get("/getinfo", getUserInfo);
router.delete("/deletecv", deleteUserCV);
router.get("/getjobinfo", getUserJobInfo);
router.put("/deletejob", deleteUserJobInfo);
router.post("/addjob", upload.single("none"), addUserJobInfo);
router.post("/addskill", upload.single("none"), addUserSkill); // Route to add a skill
router.get("/getskills", getUserSkills); // Route to get user skills
router.delete("/removeskill", removeUserSkill); // Route to remove a skill
router.get("/getUserDetails", getUserDetails);
module.exports = router;
