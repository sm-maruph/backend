const express = require("express");
const router = express.Router();

const { login, signup } = require("../controllers/authControllers");

// Login Route
router.get("/login", login);

// Signup Route
router.get("/signup", signup);

module.exports = router;
