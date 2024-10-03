const mysql = require("mysql2/promise");

const { myError } = require("../middlewares/errorMiddleware");

const getUiuUsers = async (req, res, next) => {
  const userId = req.user.id;
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
    let [results] = await connection.query(
      `SELECT * FROM user WHERE (user_type = 'student' or user_type = 'alumni') and approved = 0`
    );
    connection.end();

    return res.json(results).status(200);
  } catch (error) {
    return next(new myError(error.message, 500));
  }
};
const approved = async (req, res, next) => {
  const { id } = req.query;
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
    let [results] = await connection.query(
      `UPDATE user
SET approved = 1
WHERE id = ?;`,
      [id]
    );
    connection.end();

    return res.json({ message: "Account Successfully Approved" }).status(200);
  } catch (error) {
    return next(new myError(error.message, 500));
  }
};
const reject = async (req, res, next) => {
  const { id } = req.query;
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
    let [results] = await connection.query(
      `DELETE FROM user
WHERE id = ?;`,
      [id]
    );
    connection.end();

    return res.json({ message: "Account Successfully Deleted" }).status(200);
  } catch (error) {
    return next(new myError(error.message, 500));
  }
};
const getUnapprovedQuestions = async (req, res, next) => {
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
    let [results] = await connection.query(
      `SELECT * FROM question_bank WHERE approved = 0`
    );
    connection.end();

    return res.json(results).status(200);
  } catch (error) {
    return next(new myError(error.message, 500));
  }
};

// Function to approve a question in question_bank
const approveQuestion = async (req, res, next) => {
  const { id } = req.query;
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
    let [results] = await connection.query(
      `UPDATE question_bank SET approved = 1 WHERE id = ?;`,
      [id]
    );
    connection.end();

    return res.json({ message: "Question Successfully Approved" }).status(200);
  } catch (error) {
    return next(new myError(error.message, 500));
  }
};

// Function to reject (delete) a question from question_bank
const rejectQuestion = async (req, res, next) => {
  const { id } = req.query;
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
    let [results] = await connection.query(
      `DELETE FROM question_bank WHERE id = ?;`,
      [id]
    );
    connection.end();

    return res.json({ message: "Question Successfully Deleted" }).status(200);
  } catch (error) {
    return next(new myError(error.message, 500));
  }
};
const getUserApprovalStats = async (req, res, next) => {
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
    let [results] = await connection.query(
      `SELECT 
        SUM(CASE WHEN approved = 1 THEN 1 ELSE 0 END) AS approvedUsers, 
        SUM(CASE WHEN approved = 0 THEN 1 ELSE 0 END) AS unapprovedUsers
       FROM user 
       WHERE user_type IN ('student', 'alumni')`
    );

    connection.end();
    return res.json(results[0]).status(200);
  } catch (error) {
    return next(new myError(error.message, 500));
  }
};
const getUnapprovedQuestionCount = async (req, res, next) => {
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
    let [results] = await connection.query(
      `SELECT COUNT(*) AS unapprovedQuestions 
       FROM question_bank 
       WHERE approved = 0`
    );

    connection.end();
    return res.json(results[0]).status(200);
  } catch (error) {
    return next(new myError(error.message, 500));
  }
};

module.exports = {
  
  getUiuUsers,
  approved,
  reject,
  getUnapprovedQuestions,
  approveQuestion,
  rejectQuestion,
  getUserApprovalStats,
  getUnapprovedQuestionCount,
};
