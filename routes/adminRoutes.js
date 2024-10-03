const express = require("express");
const router = express.Router();
const {
  getUiuUsers,
  approved,
  reject,
  getUnapprovedQuestions,
  approveQuestion,
  rejectQuestion,
  getUserApprovalStats,
  getUnapprovedQuestionCount,
} = require("../controllers/adminControllers");

router.get("/getuiuusers", getUiuUsers);
router.post("/approveuser", approved);
router.post("/rejectuser", reject);
router.get("/getquestions", getUnapprovedQuestions);
router.post("/approvequestion", approveQuestion);
router.post("/rejectquestion", rejectQuestion);
router.get("/stats", getUserApprovalStats);
router.get("/pendingquestions", getUnapprovedQuestionCount);
module.exports = router;
