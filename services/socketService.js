// services/socketService.js

const chatController = require("../controllers/chatController");

let users = {};
const socketService = (io) => {
  io.of("/chat").on("connection", (socket) => {
    console.log("New client connected to /chat namespace", socket.id);
    socket.on("register", (userId) => {
      users[userId] = socket.id;
      console.log(users);
    });

    // Chat-specific events
    socket.on("sendMessage", (message) => {
      chatController.sendMessage(socket, io, message);
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      console.log("Client disconnected from /chat: ", socket.id);
    });
  });
};

module.exports = socketService;
