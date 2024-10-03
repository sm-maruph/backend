const mysql = require("mysql2/promise");
const { myError } = require("../middlewares/errorMiddleware");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const path = require("path");
const getUserProfilePicture = async (req, res, next) => {
  const { userId } = req.query;
  // Get userId from request params
  let connection;

  try {
    connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      database: "project",
    });

    const [results] = await connection.query(
      `SELECT profile_picture FROM user WHERE id = ?`,
      [userId]
    );

    if (results.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const profilePicture = results[0].profile_picture;
    res.json(profilePicture);
  } catch (err) {
    const error = new myError(err.message, 500);
    return next(error);
  } finally {
    if (connection) {
      connection.end();
    }
  }
};
const updateUserProfilePicture = async (req, res, next) => {
  const { userId } = req.query; // Get userId from request params
  const profilePicture = req.file; // Get new profile picture from request body
  let path = profilePicture.path;
  path = req.file.path.replace(/\\/g, "\\\\");

  let connection;

  try {
    connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      database: "project",
    });

    // Ensure profilePicture is provided
    if (!profilePicture) {
      return res.status(400).json({ message: "Profile picture is required" });
    }

    const [results] = await connection.query(
      `UPDATE user SET profile_picture = ? WHERE id = ?`,
      [path, userId]
    );

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "Profile picture updated successfully", url: path });
  } catch (err) {
    const error = new myError(err.message, 500);
    return next(error);
  } finally {
    if (connection) {
      connection.end();
    }
  }
};
const getUserInfo = async (req, res, next) => {
  const { userId } = req.query; // Get userId from request query
  let connection;

  try {
    connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      database: "project",
    });

    const [results] = await connection.query(
      `
        SELECT 
          u.first_name, 
          u.last_name, 
          u.user_type, 
          u.CV, 
          u.email, 
          r.Rank AS rank
        FROM user u
        JOIN student_feed_rank r ON u.id = r.uid
        WHERE u.id = ?
        `,
      [userId]
    );

    if (results.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const userInfo = results[0];
    res.json(userInfo);
  } catch (err) {
    const error = new myError(err.message, 500);
    return next(error);
  } finally {
    if (connection) {
      connection.end();
    }
  }
};
const updateCV = async (req, res, next) => {
  const { userId } = req.query; // Get userId from request params
  const File = req.file; // Get new CV file from request body
  let path = File.path;
  path = req.file.path.replace(/\\/g, "\\\\"); // Replace backslashes
  let connection;
  try {
    connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      database: "project",
    });
    // Ensure CV file is provided
    if (!File) {
      return res.status(400).json({ message: "CV is required" });
    }
    const [results] = await connection.query(
      `UPDATE user SET cv = ? WHERE id = ?`,
      [path, userId]
    );
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "CV updated successfully", url: path });
  } catch (err) {
    const error = new myError(err.message, 500);
    return next(error);
  } finally {
    if (connection) {
      connection.end();
    }
  }
};
const deleteUserCV = async (req, res, next) => {
  const { userId } = req.query; // Get userId from request params
  let connection;

  try {
    connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      database: "project",
    });

    // Execute the query to set the CV field to NULL
    const [results] = await connection.query(
      `UPDATE user SET cv = NULL WHERE id = ?`,
      [userId]
    );

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "CV deleted successfully" });
  } catch (err) {
    const error = new myError(err.message, 500);
    return next(error);
  } finally {
    if (connection) {
      connection.end();
    }
  }
};
const getUserJobInfo = async (req, res, next) => {
  const { userId } = req.query; // Get userId from request params
  let connection;

  try {
    connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      database: "project",
    });

    // Query to get job information
    const [results] = await connection.query(
      `SELECT job_title, job_start_date, company FROM user WHERE id = ?`,
      [userId]
    );

    if (
      results.length === 0 ||
      ((results[0].job_title === null || results[0].job_title === "") &&
        (results[0].job_start_date === null ||
          results[0].job_start_date === "") &&
        (results[0].company === null || results[0].company === ""))
    ) {
      return res.json(null); // Send null if no records found or all fields are null/empty
    }

    res.json(results[0]); // Send job information
  } catch (err) {
    const error = new myError(err.message, 500);
    return next(error);
  } finally {
    if (connection) {
      connection.end();
    }
  }
};

const addUserJobInfo = async (req, res, next) => {
  const { userId } = req.query; // Get userId from request params
  const { job_title, job_startdate, company } = req.body;
  console.log(req.body, userId); // Get job info from request body
  let connection;

  try {
    connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      database: "project",
    });

    // Insert query to add job information
    const [results] = await connection.query(
      `UPDATE user SET job_title = ?, job_start_date = ?, company = ? WHERE id = ?`,
      [job_title, job_startdate, company, userId]
    );

    res.json({ message: "Job information added successfully" });
  } catch (err) {
    const error = new myError(err.message, 500);
    return next(error);
  } finally {
    if (connection) {
      connection.end();
    }
  }
};

const deleteUserJobInfo = async (req, res, next) => {
  const { userId } = req.query; // Get userId and jobId from query parameters
  let connection;

  try {
    connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      database: "project",
    });

    // Ensure userId and jobId are provided

    const [results] = await connection.query(
      `UPDATE user SET job_title = NULL, job_start_date = NULL, company = NULL WHERE id = ?`,
      [userId]
    );

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.json({ message: "Job information deleted successfully" });
  } catch (err) {
    const error = new myError(err.message, 500);
    return next(error);
  } finally {
    if (connection) {
      connection.end();
    }
  }
};
const addUserSkill = async (req, res, next) => {
  const { userId } = req.query;
  const { skill } = req.body; // Extract user id and skill name from request body
  let connection;

  try {
    connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      database: "project",
    });

    // Insert new skill for the user
    const [results] = await connection.query(
      `INSERT INTO skills (uid, skill_name) VALUES (?, ?)`,
      [userId, skill]
    );

    res.json({
      message: "Skill added successfully",
      skillId: results.insertId,
    });
  } catch (err) {
    const error = new myError(err.message, 500);
    return next(error);
  } finally {
    if (connection) {
      connection.end();
    }
  }
};
const getUserSkills = async (req, res, next) => {
  const { userId } = req.query; // Extract user id from query parameters
  let connection;

  try {
    connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      database: "project",
    });

    // Query to get all skills of the user
    const [results] = await connection.query(
      `SELECT skill_id, skill_name FROM skills WHERE uid = ?`,
      [userId]
    );

    if (results.length === 0) {
      return res.json([]); // Send an empty array if no skills are found
    }

    res.json(results); // Send the skills data
  } catch (err) {
    const error = new myError(err.message, 500);
    return next(error);
  } finally {
    if (connection) {
      connection.end();
    }
  }
};
const removeUserSkill = async (req, res, next) => {
  const { skill_id } = req.query;
  console.log(skill_id); // Extract skill id from query parameters
  let connection;

  try {
    connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      database: "project",
    });

    // Query to delete the skill
    const [results] = await connection.query(
      `DELETE FROM skills WHERE skill_id = ?`,
      [skill_id]
    );

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "Skill not found" });
    }

    res.json({ message: "Skill removed successfully" });
  } catch (err) {
    const error = new myError(err.message, 500);
    return next(error);
  } finally {
    if (connection) {
      connection.end();
    }
  }
};
const getUserDetails = async (req, res, next) => {
  const { userId } = req.query; // Get userId from request params
  let connection;

  try {
    // Establish database connection
    connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      database: "project", // Replace with your database name
    });

    // SQL query to join user, city, and country tables
    const [results] = await connection.query(
      `SELECT 
           u.gender, 
           u.email, 
           u.phone, 
           u.address, 
           c.city_name, 
           cn.country_name
         FROM user u
         LEFT JOIN cities c ON u.location = c.id
         LEFT JOIN countries cn ON c.country_id = cn.id
         WHERE u.id = ?`,
      [userId]
    );

    // Check if the user exists
    if (results.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Send back user details with city and country
    res.json({
      gender:
        results[0].gender.charAt(0).toUpperCase() +
        results[0].gender.slice(1).toLowerCase(),
      email: results[0].email,
      phone_number: results[0].phone,
      address: results[0].address,
      city: results[0].city_name,
      country: results[0].country_name,
    });
  } catch (err) {
    const error = new Error(err.message);
    error.statusCode = 500;
    return next(error);
  } finally {
    // Close the connection
    if (connection) {
      connection.end();
    }
  }
};
const editUserDetails = async (req, res, next) => {
  const { userId } = req.query; // Get userId from request query
  const { gender, email, phone, address, city_id } = req.body; // Data from the request body
  let connection;

  try {
    // Establish database connection
    connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      database: "project", // Replace with your database name
    });

    // Build the update query dynamically
    let query = "UPDATE user SET ";
    const fields = [];
    const values = [];

    // Dynamically add fields to update only if they are provided
    if (gender !== undefined) {
      fields.push("gender = ?");
      values.push(gender.toLowerCase());
    }
    if (email !== undefined) {
      fields.push("email = ?");
      values.push(email);
    }
    if (phone !== undefined) {
      fields.push("phone = ?");
      values.push(phone);
    }
    if (address !== undefined) {
      fields.push("address = ?");
      values.push(address);
    }
    if (city_id !== undefined) {
      fields.push("location = ?"); // Assuming location refers to city_id
      values.push(city_id);
    }

    // If no fields to update, return an error
    if (fields.length === 0) {
      return res
        .status(400)
        .json({ message: "No valid fields provided for update" });
    }

    // Complete the query with the fields and userId
    query += fields.join(", ") + " WHERE id = ?";
    values.push(userId); // Add userId to values for the WHERE clause

    // Execute the update query
    const [result] = await connection.query(query, values);

    // Check if any rows were affected (if userId exists)
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "User not found or no changes made" });
    }

    // Send success response
    res.status(200).json({ message: "User details updated successfully" });
  } catch (err) {
    const error = new Error(err.message);
    error.statusCode = 500;
    return next(error);
  } finally {
    // Close the connection
    if (connection) {
      connection.end();
    }
  }
};

module.exports = {
  getUserDetails,
  updateCV,
  getUserProfilePicture,
  updateUserProfilePicture,
  getUserInfo,
  deleteUserCV,
  getUserJobInfo,
  addUserJobInfo,
  deleteUserJobInfo,
  addUserSkill,
  getUserSkills,
  removeUserSkill,
  editUserDetails,
};
