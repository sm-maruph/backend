const express = require("express");
const router = express.Router();
const { body } = require("express-validator");

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

const {
  login,
  signup,
  getLocation,
} = require("../controllers/authControllers");
router.get("/getlocation", getLocation);
// Login Route
router.post(
  "/login",

  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage(
      "The email address you entered is not valid. Please check and try again"
    ),

  login
);

// Signup Route
router.post(
  "/signup",
  upload.single("profilePicture"),
  [
    body("email").isEmail().withMessage("Please provide a valid email address"),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long"),
  ],
  signup
);

module.exports = router;
