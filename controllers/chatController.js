// controllers/chatController.js

const chatController = {
  sendMessage: (socket, io, message) => {
    console.log(`Message from ${socket.id}: ${message}`);

    // Broadcast message to all clients in the '/chat' namespace
    io.of("/chat").emit("receiveMessage", message);
  },
};

module.exports = chatController;
