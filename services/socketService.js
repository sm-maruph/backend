// services/socketService.js

const { sendMessage } = require("../controllers/chatController");

let users = {};
const socketService = (io) => {
  io.of("/chat").on("connection", (socket) => {
    console.log("New client connected to /chat namespace", socket.id);
    socket.on("register", (userId) => {
      users[userId] = socket.id;
      console.log(users);
    });

    // Chat-specific events
    socket.on("send_message", (data) => {
      const { senderId, reciverId, message } = data;

      sendMessage(senderId, reciverId, message);

      if (users[reciverId]) {
        socket
          .to(users[reciverId])
          .emit("receive_message", { senderId, reciverId, message });
      }
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      console.log("Client disconnected from /chat: ", socket.id);
      for (const userId in users) {
        if (users[userId] === socket.id) {
          delete users[userId]; // Remove user ID from the users object
          console.log(`Removed user: ${userId}`);
          break; // Exit loop after removing the user
        }
      }
      console.log(users);
    });
  });
};

module.exports = socketService;
