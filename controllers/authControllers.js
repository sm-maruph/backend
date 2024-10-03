const mysql = require("mysql2/promise");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const path = require("path");
const { validationResult } = require("express-validator");
const { myError } = require("../middlewares/errorMiddleware");

const jwt = require("jsonwebtoken");

const JWT_SECRET = "elDradoX";

const login = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    var message = errors
      .array()
      .map((err) => {
        return err.msg;
      })
      .join(",");

    const error = new myError(message, 201);
    return next(error);
  }
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
    const { email, password } = req.body;
    console.log(email, password);

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

    if (checkPass) {
      if (results[0].approved) {
        const token = jwt.sign(
          {
            id: results[0].id,
            email: results[0].email,
            firstName: results[0].first_name,
            lastName: results[0].last_name,
            profilePicture: results[0].profile_picture,
            role: results[0].user_type,
          },
          JWT_SECRET,
          { expiresIn: "1h" }
        );
        connection.end();
        res.status(200).json({ token });
      } else {
        const error = new myError(
          "Your Account is Currently under Review,",
          403
        );
        return next(error);
      }
    } else {
      // Passwords don't match, return a 401 error
      const error = new myError(
        "Unable to authenticate. Please check your credentials and try again.",
        401
      );
      return next(error);
    }
  } catch (error) {
    console.log(error);
    return next(error);
  }
};

/////Sign up Functionn...

const signup = async (req, res, next) => {
 

 
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    var message = errors
      .array()
      .map((err) => {
        return err.msg;
      })
      .join(" & ");

    const error = new myError(message, 401);
    return next(error);
  }
  let connection;
  try {
    connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      database: "project",
    });
  } catch (err) {
    const error = new myError(err.message, 500);
    return next(error);
  }

  const {
    firstName,
    lastName,
    email,
    password,
    gender,
    userType,
    address,
    city,
    department,
    number,
    uiuId,
  } = req.body;
  const approved = userType === "guest" ? true : false;
  function trimFirstZero(str) {
    // Check if the string starts with '0' and remove it
    if (str.length > 0 && str[0] === "0") {
      return str.substring(1); // Return the string without the first character
    }
    return str; // Return the original string if it doesn't start with '0'
  }
  let path;
  if (!req.file) {
    path = `uploads/No_Profile.jpg`;
  } else {
    path = req.file.path.replace(/\\/g, "\\\\");
  }

  try {
    let [results] = await connection.query(`SELECT * FROM USER WHERE email=?`, [
      email,
    ]);

    if (results.length !== 0) {
      const error = new myError(
        "A user with this email  already exists in our system.",
        409
      );
      return next(error);
    }
    let [results2] = await connection.query(
      `SELECT * FROM USER WHERE uiu like ?`,
      [trimFirstZero(uiuId)]
    );

    if (results2.length !== 0) {
      const error = new myError(
        "A user with this UIU ID  already exists in our system.",
        409
      );
      return next(error);
    }

    const salt = await bcrypt.genSalt(10);
    let securePassword = await bcrypt.hash(password, salt);

    let id = uuidv4();

    const [R, F] = await connection.query(
      `INSERT INTO user (
          id, 
          first_name, 
          last_name, 
          email, 
          password, 
          profile_picture, 
          gender, 
          user_type, 
          phone, 
          address, 
          location, 
          department_id, 
          approved,
          uiu
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)`,
      [
        id,
        firstName,
        lastName,
        email,
        securePassword,
        path,
        gender,
        userType,
        number,
        address,
        city,
        department | null, // Use null if department is undefined
        approved,
        uiuId | null,
      ]
    );
    if (userType === "student") {
      let [a] = await connection.query(
        "INSERT INTO `student_feed_rank`(`uid`, `Rank`) VALUES (?,?)",
        [id, "Fresher"]
      );
    } else if (userType === "alumni") {
      let [a] = await connection.query(
        "INSERT INTO `student_feed_rank`(`uid`, `Rank`) VALUES (?,?)",
        [id, "Alumni"]
      );
    } else {
      let [a] = await connection.query(
        "INSERT INTO `student_feed_rank`(`uid`, `Rank`) VALUES (?,?)",
        [id, "None"]
      );
    }

    // fields contains extra meta data about results, if available
    connection.end();
    const token = jwt.sign(
      {
        id,
        email,
        firstName,
        lastName,
        profilePicture: path,
        role: userType,
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );
    if (!approved) {
      const error = new myError(
        "Your Account Creation Request has been Sent, We Will Shortly notify You",
        403
      );
      return next(error);
    }
    res
      .send({
        token,
      })
      .status(200);
  } catch (err) {
    console.log(err);
    next(err);
  }
};
/// get Cites and Location
const getLocation = async (req, res, next) => {
  let connection;
  console.log("connected");
  try {
    connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      database: "project",
    });
  } catch (err) {
    const error = new myError(err.message, 500);
    return next(error);
  }

  try {
    let [results] = await connection.query(`SELECT * FROM cities WHERE 1`);
    const cities = results.map((item) => {
      return { id: item.id, label: item.city_name };
    });
    res.json(cities);
  } catch (err) {
    const error = new myError(err.message, 500);
    return next(error);
  }
};

module.exports = { login, signup, getLocation };
