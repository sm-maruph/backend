const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const authRoute = require("./routes/authRoutes.js");
const feedRoute = require("./routes/feedRoute.js");
const questionRoute = require("./routes/questionRoutes.js");
const { customError } = require("./middlewares/errorMiddleware.js");
const verifyToken = require("./middlewares/authorization.js");

const app = express();

// Middleware
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));
app.use("/feed", express.static("feed"));
app.use("/questionpdf", express.static("questionpdf")); // Parse URL-encoded bodies

// Routes
app.use("/auth", authRoute);
app.use("/feed", verifyToken, feedRoute);
app.use("/question", verifyToken, questionRoute);

// Start the server
const PORT = 3000;

app.use(customError);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
