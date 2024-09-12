const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const authRoute = require("./routes/authRoutes.js");
const feedRoute = require("./routes/feedRoute.js");
const marketplace = require("./routes/marketplaceRoute.js");
const { customError } = require("./middlewares/errorMiddleware.js");
const verifyToken = require("./middlewares/authorization.js");
const questionRoute = require("./routes/questionRoute"); // Correct path to your route file

const app = express();

// Middleware
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON bodies
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/uploads", express.static("uploads"));
app.use("/feed", express.static("feed")); // Parse URL-encoded bodies
app.use("/marketplace", express.static("marketplace"));
// Routes
app.use("/auth", authRoute);

//saddy
app.use("/question", express.static("question")); // Parse URL-encoded bodies

//Routes
app.use("/auth", authRoute);
app.use("/feed", verifyToken, feedRoute);
app.use("/marketplace", verifyToken, marketplace);

//saddy
app.use("/questions", verifyToken, questionRoute);
// Start the server
const PORT = 3000;

app.use(customError);
const handleFunction = (req, res, next) => {
  console.log(req.body);
  console.log(req.user);
  console.log(req.files); //req.files array
};

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
