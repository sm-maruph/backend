const express = require("express");
const router = express.Router();


const { addToInbox } = require("../controllers/chatController");

// Example route (optional) - if you need to serve a chat history endpoint
router.get("/history", (req, res) => {
  // Logic to get chat history (if stored in a database)
  res.json({ message: "Chat history endpoint" });
});
router.post("/add", addToInbox);

module.exports = router;
