const mysql = require("mysql2/promise");
const { myError } = require("../middlewares/errorMiddleware");

const postQuestion = async (req, res, next) => {
  const { department, courseName, courseCode, trimester, examType, year } =
    req.body;
  const file = req.file;
  const uid = req.user.id;

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
      "INSERT INTO question(uid, course_name, course_code, trimester, year, exam_type, path, department) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
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

  try {
    const [rows] = await connection.query("SELECT q.*, u.profile_picture FROM question q JOIN user u ON q.uid = u.id");
    connection.end();

    return res.status(200).json(rows);
  } catch {
    return next(new myError("Database Query Failed", 500));
  }
};

const getFilteredQuestions = async (req, res, next) => {
  const { department, examType, trimester, year, search } = req.body;
  let connection;

  // Initialize query components
  let baseQuery = "SELECT q.*, u.profile_picture FROM question q JOIN user u ON q.uid = u.id WHERE ";
  let conditions = [];
  let queryParams = [];

  // Add conditions based on filters
  if (department) {
    conditions.push("department LIKE ?");
    queryParams.push(`%${department}%`);
  }

  if (examType) {
    conditions.push("exam_type LIKE ?");
    queryParams.push(`%${examType}%`);
  }

  if (trimester && trimester.length > 0) {
    conditions.push(`trimester IN (${trimester.map(() => "?").join(", ")})`);
    queryParams.push(...trimester);
  }

  if (year && year.length > 0) {
    conditions.push(`year IN (${year.map(() => "?").join(", ")})`);
    queryParams.push(...year);
  }

  // Add search conditions
  if (search) {
    conditions.push("(course_name LIKE ? OR course_code LIKE ?)");
    queryParams.push(`%${search}%`, `%${search}%`);
  }

  // If no conditions are added, return all rows
  if (conditions.length === 0) {
    baseQuery += "1=1"; // Default condition to select all rows
  } else {
    baseQuery += conditions.join(" AND "); // Join all conditions with AND
  }

  // Connect to the database
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

  // Execute the query with the constructed parameters
  try {
    const [rows] = await connection.execute(baseQuery, queryParams);
    connection.end();

    return res.status(200).json(rows);
  } catch (err) {
    console.error("Database Query Failed:", err.message);
    return next(new myError("Database Query Failed", 500));
  }
};

const deleteQuestion = async (req, res, next) => {
  const qID = req.params.qID;
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
    connection.query("DELETE FROM `question` WHERE id = ?", [qID]);
    connection.end;
    res.send({ message: "Successfull" });
  } catch (error) {
    return next(myError(error.message, 400));
  }
}

module.exports = {
  postQuestion,
  getPdf,
  getFilteredQuestions,
  deleteQuestion,
};
