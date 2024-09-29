// controllers/chatController.js
const { myError } = require("../middlewares/errorMiddleware");
const mysql = require("mysql2/promise");

const addToInbox = async (req, res, next) => {
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
const getInbox = async (req, res, next) => {
  //chat/getinbox

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
    const [result] = await connection.query(
      `SELECT 
    CASE 
        WHEN inbox.uid = ? THEN inbox.chat
        ELSE inbox.uid
    END AS reciverId
FROM inbox
WHERE inbox.uid = ? OR inbox.chat = ?;
`,
      [uid, uid, uid]
    );
    if (result.length === 0) {
      return res.json([]);
    }
    const userIds = result.map((user) => user.reciverId);

    const placeholders = userIds.map(() => "?").join(", "); // Create placeholders (?, ?, ?...)
    const query = `SELECT * FROM user WHERE id IN (${placeholders})`; // Dynamic query with placeholders

    // Execute the query with userIds as parameters
    const [users] = await connection.query(query, userIds);

    return res.json(users);
  } catch (error) {
    console.log(error.message);
    return next(new myError(error.message, 500));
  }
};
const sendMessage = async (senderId, reciverId, message) => {
  let connection;

  try {
    connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      database: "project",
    });
  } catch (err) {
    console.log(err.message);
  }

  try {
    const [results, field] = await connection.query(
      `INSERT INTO messages (sender_id, receiver_id, message_text) VALUES (?, ?, ?)`,
      [senderId, reciverId, message]
    );
  } catch (error) {
    console.log(error.message);
  }
};
const getMessage = async (req, res, next) => {
  const uid = req.user.id;
  const reciverID = req.query.reciverId;
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
    const [result] = await connection.query(
      `SELECT sender_id as senderId,receiver_id as reciverId,message_text as message
FROM messages
WHERE (sender_id = ? AND receiver_id = ?)
   OR (sender_id = ? AND receiver_id = ?)
ORDER BY sent_at ASC;
`,
      [uid, reciverID, reciverID, uid]
    );
    res.send(result);
  } catch (error) {
    console.log(error.message);
    return next(new myError(error.message, 500));
  }
};
const getUserById = async (req, res, next) => {
  const { id } = req.query;
  let connection;
  try {
    connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      database: "project",
    });
  } catch (err) {
    const error = new myError("Xammp Server Error", 500);
    return next(error);
  }
  try {
    const [result] = await connection.query(`SELECT * FROM USER WHERE ID = ?`, [
      id,
    ]);
    res.send(result[0]);
  } catch (error) {
    console.log(error.message);
    return next(new myError(error.message, 500));
  }
};
module.exports = { addToInbox, getInbox, sendMessage, getMessage, getUserById };
