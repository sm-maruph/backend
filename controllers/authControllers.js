const mysql = require("mysql2/promise");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const path = require("path");

const JWT_SECRET = "elDradoX";

const login = async (req, res, next) => {
  const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    database: "project",
  });
  const { email, password } = req.body;
  console.log(email, password);

  try {
    const [results, fields] = await connection.query(
      `SELECT * FROM user WHERE email = ?`,
      [email]
    );

    if (results.length === 0) {
      // User not found, return a 404 error
      return res.status(404).json({ message: "User Not Found" });
    }

    const checkPass = await bcrypt.compare(password, results[0].password);
    console.log(checkPass);

    if (checkPass) {
      // Passwords match, return success
      return res.status(200).json({ message: "Login successful" });
    } else {
      // Passwords don't match, return a 401 error
      return res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    // Catch any unexpected errors and return a 500 error
    console.error("Error during login process:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

const signup = async (req, res) => {
  const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    database: "project",
  });

  const { firstName, lastName, email, password, gender, userType } = req.body;
  const { path } = req.file;

  const salt = await bcrypt.genSalt(10);
  let securePassword = await bcrypt.hash(password, salt);

  let id = uuidv4();

  try {
    const [results, fields] = await connection.query(
      `INSERT INTO user (id, first_name, last_name, email, password, profile_picture, gender, user_type) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, firstName, lastName, email, securePassword, path, gender, userType]
    );

    // fields contains extra meta data about results, if available
    res.send({ message: "Mission Success" }).status(200);
  } catch (err) {
    console.log(err);
  }
};
module.exports = { login, signup };
