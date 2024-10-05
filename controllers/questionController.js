const mysql = require("mysql2/promise");
const { myError } = require("../middlewares/errorMiddleware");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");

const postQuestion = async (req, res, next) => {
  const { department, courseName, courseCode, trimester, examType, year } =
    req.body;
  console.log(year);
  const file = req.file;
  const uid = req.user.id;
  const id = uuidv4();
  let connection;
  try {
    connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      database: "project",
    });
  } catch (err) {
    console.error("Database Connection Error:", err.message); // Log connection errors
    return next(new myError("Xammp Server Error", 500));
  }

  try {
    const [result] = await connection.query(
      "INSERT INTO question_bank(id,uid, course, code, trimester, year, exam_type, pdf, department) VALUES (?,?, ?, ?, ?, ?, ?, ?, ?)",
      [
        id,
        uid,
        courseName,
        courseCode,
        trimester,
        year,
        examType,
        file.path,
        department,
      ]
    );
    connection.end();
    return res.status(200).send({ message: "Mission Successful.." });
  } catch (error) {
    console.error("Database Insert Error:", error.message); // Log the exact error
    console.error("Full Error Object:", error); // Log the full error object for deeper inspection
    return next(new myError(error.message, 500));
  }
};

const getPdf = async (req, res, next) => {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      database: "project",
    });
  } catch (err) {
    return next(new myError("Database connection error", 500));
  }
  const { search, department, year, trimester, examType } = req.body;

  let query =
    "SELECT *,q.id FROM question_bank q JOIN user u ON q.uid = u.id where q.approved = 1";
  let queryParams = [];
  let conditions = [];

  if (search) {
    conditions.push("q.course LIKE ?");
    queryParams.push(`%${search}%`);
  }
  if (department.length > 0) {
    conditions.push("q.department IN (?)");
    queryParams.push(department);
  }

  // Year condition
  if (year.length > 0) {
    conditions.push("q.year IN (?)");
    queryParams.push(year);
  }

  // Trimester condition
  if (trimester.length > 0) {
    conditions.push("q.trimester IN (?)");
    queryParams.push(trimester);
  }

  // ExamType condition
  if (examType.length > 0) {
    conditions.push("q.exam_type IN (?)");
    queryParams.push(examType);
  }

  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }

  console.log(query, queryParams);
  try {
    const [rows] = await connection.query(query, queryParams);
    connection.end();

    return res.status(200).json(rows);
  } catch (err) {
    return next(new myError(err.message, 500));
  }
};

const deleteQuestion = async (req, res, next) => {
  const { id, pdfPath } = req.body;

  console.log("Received for deletion:", id, pdfPath);

  // Establish database connection
  let connection;
  try {
    connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      database: "project",
    });
  } catch (err) {
    console.error("Database Connection Error:", err.message);
    return next(new myError("XAMPP Server Error", 500));
  }

  try {
    // Attempt to delete the question from the database
    await connection.query("DELETE FROM question_bank WHERE id = ?", [id]);
    await connection.end(); // Properly close the connection

    // Try to delete the file after successful database operation
    try {
      fs.unlinkSync(pdfPath); // Synchronously delete the file
      console.log(`File deleted successfully: ${pdfPath}`);
      res.status(200).send({ message: "Deletion successful" }); // Send success response
    } catch (fileError) {
      console.error(`Error deleting file at ${pdfPath}:`, fileError.message);
      // File deletion failed, but the question was removed; send a response indicating partial success
      res
        .status(500)
        .send({ message: "Question deleted but file deletion failed" });
    }
  } catch (dbError) {
    console.error("Database Query Error:", dbError.message);
    return next(new myError("Failed to delete question", 400));
  }
};

const updateQuestion = async (req, res, next) => {
  const { department, courseName, courseCode, trimester, examType, year, id } =
    req.body;

  let connection;
  try {
    connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      database: "project",
    });
  } catch (err) {
    console.error("Database Connection Error:", err.message); // Log connection errors
    return next(new myError("Xammp Server Error", 500));
  }

  try {
    const [result] = await connection.query(
      "UPDATE question_bank SET trimester = ?,course = ?,code = ?,year = ?,department = ?,exam_type = ?WHERE id = ?;",
      [trimester, courseName, courseCode, year, department, examType, id]
    );
    connection.end();
    return res.status(200).send({ message: "Mission Successful.." });
  } catch (error) {
    console.error("Database Insert Error:", error.message); // Log the exact error
    console.error("Full Error Object:", error); // Log the full error object for deeper inspection
    return next(new myError(error.message, 500));
  }
};
module.exports = {
  postQuestion,
  getPdf,
  deleteQuestion,
  updateQuestion,
};
