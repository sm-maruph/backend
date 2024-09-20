const express = require("express");
const router = express.Router();

// Example route (optional) - if you need to serve a chat history endpoint
router.get("/history", (req, res) => {
  // Logic to get chat history (if stored in a database)
  res.json({ message: "Chat history endpoint" });
});

module.exports = router;
