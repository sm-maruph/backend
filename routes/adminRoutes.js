const express = require("express");
const router = express.Router();
const {
  getUiuUsers,
  approved,
  reject,
} = require("../controllers/adminControllers");

router.get("/getuiuusers", getUiuUsers);
router.post("/approveuser", approved);
router.post("/rejectuser", reject);
router.get("getquestions", () => {});
router.get("/approvequestion", () => {});
router.get("/rejectquestion", () => {});
module.exports = router;
