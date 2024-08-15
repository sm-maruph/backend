const mysql = require("mysql2/promise");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const path = require("path");

const { myError } = require("../middlewares/errorMiddleware");
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
      throw new myError(
        "Unable to authenticate. Please check your credentials and try again.",
        404
      );
    }

    const checkPass = await bcrypt.compare(password, results[0].password);
    console.log(checkPass);

    if (checkPass) {
      // Passwords match, return success
      return res.status(200).json({ message: "Login successful" });
    } else {
      // Passwords don't match, return a 401 error
      throw new myError(
        "Unable to authenticate. Please check your credentials and try again.",
        401
      );
    }
  } catch (error) {
    next(error);
    console.log(error.message);
  }
};

const signup = async (req, res, next) => {
  const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    database: "project",
  });

  const { firstName, lastName, email, password, gender, userType } = req.body;
  let path;
  if (!req.file) {
    path = `uploads/No_Profile.jpg`;
  } else {
    path = req.file.path;
  }

  try {
    let [results] = await connection.query(`SELECT * FROM USER WHERE email=?`, [
      email,
    ]);
    if (results.length !== 0) {
      throw new myError(
        "A user with this email  already exists in our system.",
        409
      );
    }

    const salt = await bcrypt.genSalt(10);
    let securePassword = await bcrypt.hash(password, salt);

    let id = uuidv4();

    let [R, F] = await connection.query(
      `INSERT INTO user (id, first_name, last_name, email, password, profile_picture, gender, user_type) VALUES ('${id}','${firstName}','${lastName}','${email}','${securePassword}','${path}','${gender}', '${userType}')`
    );

    // fields contains extra meta data about results, if available
    res.send({ message: "Mission Success" }).status(200);
  } catch (err) {
    console.log(err);
    next(err);
  }
};
module.exports = { login, signup };
