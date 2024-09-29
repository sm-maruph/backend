const express = require("express");
const router = express.Router();

const {
  addToInbox,
  getInbox,
  getMessage,
  getUserById,
} = require("../controllers/chatController");

// Example route (optional) - if you need to serve a chat history endpoint
router.get("/history", (req, res) => {
  // Logic to get chat history (if stored in a database)
  res.json({ message: "Chat history endpoint" });
});
router.post("/add", addToInbox);
router.get("/getinbox", getInbox);
router.get("/getmessage", getMessage);
router.get("/userbyid", getUserById);

module.exports = router;
