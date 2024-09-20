// controllers/chatController.js
const { myError } = require("../middlewares/errorMiddleware");
const mysql = require("mysql2/promise");

const chatController = {
  sendMessage: (socket, io, message) => {
    console.log(`Message from ${socket.id}: ${message}`);

    // Broadcast message to all clients in the '/chat' namespace
    io.of("/chat").emit("receiveMessage", message);
  },
};

const addToInbox = async (req, res, next) => {
  console.log("reached");
  const { chat } = req.body;
  const uid = req.user.id;

  let connection;
  try {
    connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      database: "project",
    });
  } catch (err) {
    return next(new myError("Xammp Server Error", 500));
  }

  try {
    const [check] = await connection.query(
      `SELECT * FROM inbox 
WHERE (uid = ? AND chat = ?) OR (uid = ? AND chat = ?);`,
      [uid, chat, chat, uid]
    );
    if (check.length !== 0) {
      return res.json({ message: "Already Exists" });
    }
    const [results, field] = await connection.query(
      `INSERT INTO inbox(uid, chat) VALUES (?,?)`,
      [uid, chat]
    );
    res.status(200).json({ message: "Added to table" });
    connection.end();
  } catch (error) {
    return next(new myError(error.message, 500));
  }
};

module.exports = { chatController, addToInbox };
