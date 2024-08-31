const mysql = require("mysql2/promise");
const { myError } = require("../middlewares/errorMiddleware");
const { v4: uuidv4 } = require("uuid");

const getQuestions = async (req, res, next) => {
  const input = req.params.input;

  let connection;
  try {
    connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      database: "project",
    });
    const [result, field] = await connection.query(
      "SELECT * FROM `question_bank` WHERE course like ?",
      [`${input}%`]
    );
    connection.end();

    res.status(200).json({
      data: result,
    });
  } catch (error) {
    return next(new myError("Comment could Found", 404));
  }
};

module.exports = {
  getQuestions,
};
