const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const authRoute = require("./routes/authRoutes.js");
const adminRoute = require("./routes/adminRoutes.js");
const feedRoute = require("./routes/feedRoute.js");
const marketplace = require("./routes/marketplaceRoute.js");

const myprofile = require("./routes/myprofileRoute.js");
const { customError } = require("./middlewares/errorMiddleware.js");
const verifyToken = require("./middlewares/authorization.js");
const questionRoute = require("./routes/questionRoute"); // Correct path to your route file
const chatRoutes = require("./routes/chatRoutes");
const socketService = require("./services/socketService");
const alumniRoutes = require("./routes/alumniRoutes");

//Chat Application
const http = require("http"); // Required for Socket.IO to work
const { Server } = require("socket.io");
const { Socket } = require("dgram");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

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
app.use("/myprofile", myprofile);
app.use("/admin", verifyToken, adminRoute);
app.use("/feed", verifyToken, feedRoute);
app.use("/marketplace", verifyToken, marketplace);

//saddy
app.use("/questions", verifyToken, questionRoute);

app.use("/alumni", verifyToken, alumniRoutes);
// Start the server
const PORT = 3000;

app.use("/chat", verifyToken, chatRoutes);
socketService(io);

app.use(customError);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
