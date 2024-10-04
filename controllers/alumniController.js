const { v4: uuidv4 } = require("uuid");
const mysql = require("mysql2/promise");
const { myError } = require("../middlewares/errorMiddleware");



const getPosts = async (req, res, next) => {
  console.log(req.query);
  const uid = req.user.id;
  console.log("Current User ID (uid):", uid); // Log the uid for debugging

  const { searchQuery, batch, department } = req.query; // Destructure query parameters
  console.log("Search Query:", searchQuery);
  console.log("Batch:", batch);
  console.log("Department:", department);

  let connection;
  try {
    connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      database: "project",
    });
  } catch (error) {
    return next(new myError("XAMPP Error: Failed to connect to database", 500));
  }

  try {
    // Base query
    let query = `
      SELECT u.*, d.name 
      FROM user u
      JOIN department d ON u.department_id = d.id
      WHERE u.user_type = 'alumni' 
      AND u.approved = '1'
      AND u.id != ?
    `;

    const conditions = []; // Array to hold dynamic conditions
    const parameters = [uid]; // Array to hold dynamic parameters

    // Add conditions based on the presence of parameters
    if (searchQuery) {
      conditions.push(
        `(u.first_name LIKE ? OR u.last_name LIKE ? OR u.company LIKE ?)`
      );
      parameters.push(
        `%${searchQuery}%`,
        `%${searchQuery}%`,
        `%${searchQuery}%`
      );
    }
    if (batch) {
      conditions.push(`u.batch LIKE ?`); // Use LIKE for partial matching
      parameters.push(`%${batch}%`); // Add wildcards for matching
    }

    if (department) {
      conditions.push(`d.id = ?`); // Ensure to use the ID for filtering
      parameters.push(department);
    }

    // If there are any conditions, append them to the query
    if (conditions.length > 0) {
      query += ` AND ` + conditions.join(" AND ");
    }

    const [result] = await connection.execute(query, parameters); // Execute the query with parameters
    connection.end();
    res.status(200).json(result);
  } catch (error) {
    connection.end(); // Close connection on error
    return next(new myError(error.message, 500));
  }
};

const getStories = async (req, res, next) => {
  let connection;
  try {
    // Establish connection to the MySQL database
    connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      database: "project",
    });
  } catch (error) {
    return next(new myError("XAMPP Error: Failed to connect to database", 500));
  }

  try {
    // Query to get success stories
    let query = `
        SELECT 
            success_stories.id, 
            success_stories.title, 
            success_stories.description, 
            success_stories.image_url, 
            success_stories.reactions, 
            success_stories.timestamp, 
            user.id AS user_id, 
            user.first_name AS user_first_name, 
            user.last_name AS user_last_name, 
            user.email AS user_email, 
            user.profile_picture
        FROM 
            success_stories
        JOIN 
            user 
        ON 
            success_stories.uid = user.id;
    `;

    // Execute the query
    const [result] = await connection.execute(query);

    // Log the query result
    console.log("Query Result:", result);

    // Send a success response with the data
    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching success stories:", error.message); // Log the error message
    return next(new myError(error.message, 500));
  } finally {
    // Ensure the connection is closed
    if (connection) {
      await connection.end(); // Ensure to close the connection
    }
  }
};

const connectRequest = async (req, res, next) => {
  let connection;
  const uid = req.user.id; // Get user ID from the authenticated user
  const { alumniId, message } = req.query; // Get alumni ID and message
  const alumniIdStr = alumniId.alumniID;
  console.log(uid);
  console.log(message);
  console.log(alumniIdStr);
  try {
    // Establish connection to the MySQL database
    connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      database: "project",
    });
  } catch (error) {
    return next(new myError("XAMPP Error: Failed to connect to database", 500));
  }

  try {
    // Check if a connection already exists
    const checkQuery = `SELECT * FROM alumni_connect WHERE uid = ? AND alumni_id = ?`;
    const [existingConnection] = await connection.execute(checkQuery, [
      uid,
      alumniIdStr,
    ]);

    if (existingConnection.length > 0) {
      // If a connection exists, send a response indicating that
      return res.status(400).json({ message: "Connection already exists." });
    }

    // Query to insert the connection request
    let query = `
    INSERT INTO alumni_connect (uid, alumni_id, message) 
    VALUES (?, ?, ?)
  `;

    // Execute the query
    const [result] = await connection.execute(query, [
      uid,
      alumniIdStr,
      message,
    ]);

    // Send a success response with a message
    res.status(200).json({ message: "Connection request sent successfully!" });
  } catch (error) {
    console.error("Error sending connect request:", error.message); // Log the error message
    return next(new myError(error.message, 500));
  } finally {
    // Ensure the connection is closed
    if (connection) {
      await connection.end(); // Ensure to close the connection
    }
  }
};

const getConnectionCheck = async (req, res, next) => {
  let connection;
  const uid = req.user.id; // Get user ID from the authenticated user
  const alumniID = req.query.alumniId.alumniID;
  // console.log(alumniID)

  try {
    // Establish connection to the MySQL database
    connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      database: "project",
    });
  } catch (error) {
    return next(new myError("XAMPP Error: Failed to connect to database", 500));
  }

  try {
    // Query to check if the user is connected to the specified alumni
    const query = `
      SELECT COUNT(*) AS connectionCount 
      FROM alumni_connect 
      WHERE 
          (uid = ? AND alumni_id = ? AND approval = "1") OR 
          (uid = ? AND alumni_id = ? AND approval = "1") ;
    `;

// Execute the query
const [result] = await connection.execute(query, [uid, alumniID, alumniID, uid]);

// Check if a connection exists
const isConnected = result[0].connectionCount > 0; // true if connection exists, false otherwise
console.log(isConnected);

    // Send a success response with the connection status
    res.status(200).json({ isConnected });
  } catch (error) {
    console.error("Error checking connection:", error.message); // Log the error message
    return next(new myError(error.message, 500));
  } finally {
    // Ensure the connection is closed
    if (connection) {
      await connection.end(); // Ensure to close the connection
    }
  }
};

const getPendingConnectionCheck = async (req, res, next) => {
  let connection;
  const uid = req.user.id; // Get user ID from the authenticated user
  const alumniID = req.query.alumniId.alumniID;
  // console.log(alumniID)

  try {
    // Establish connection to the MySQL database
    connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      database: "project",
    });
  } catch (error) {
    return next(new myError("XAMPP Error: Failed to connect to database", 500));
  }

  try {
    // Query to check if the user is connected to the specified alumni
    const query = `
      SELECT COUNT(*) AS connectionCount 
      FROM alumni_connect 
      WHERE uid = ? AND alumni_id = ? AND approval ="0";
    `;

    // Execute the query
    const [result] = await connection.execute(query, [uid, alumniID]);

    // Check if a connection exists
    const isPending = result[0].connectionCount > 0; // true if connection exists, false otherwise
    console.log(isPending);
    // Send a success response with the connection status
    res.status(200).json({ isPending });
  } catch (error) {
    console.error("Error checking connection:", error.message); // Log the error message
    return next(new myError(error.message, 500));
  } finally {
    // Ensure the connection is closed
    if (connection) {
      await connection.end(); // Ensure to close the connection
    }
  }
};


const getAcceptCheck = async (req, res, next) => {
  let connection;
  const uid = req.user.id; // Get user ID from the authenticated user
  const alumniID = req.query.alumniId.alumniID;
  // console.log(alumniID)

  try {
    // Establish connection to the MySQL database
    connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      database: "project",
    });
  } catch (error) {
    return next(new myError("XAMPP Error: Failed to connect to database", 500));
  }

  try {
    // Query to check if the user is connected to the specified alumni
    const query = `
      SELECT COUNT(*) AS connectionCount 
      FROM alumni_connect 
      WHERE uid = ? AND alumni_id = ? AND approval ="0";
    `;

    // Execute the query
    const [result] = await connection.execute(query, [ alumniID,uid]);

    // Check if a connection exists
    const isAccept = result[0].connectionCount > 0; // true if connection exists, false otherwise
    console.log(isAccept);
    // Send a success response with the connection status
    res.status(200).json({ isAccept });
  } catch (error) {
    console.error("Error checking connection:", error.message); // Log the error message
    return next(new myError(error.message, 500));
  } finally {
    // Ensure the connection is closed
    if (connection) {
      await connection.end(); // Ensure to close the connection
    }
  }
};


const getConnectedPosts = async (req, res, next) => {
  const uid = req.user.id;
  // console.log("Current User ID (uid):", uid); // Log the uid for debugging

  // const { alumniId } = req.query; // Destructure query parameters
  console.log("This is from get connectedPost");

  let connection;
  try {
    connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      database: "project",
    });
  } catch (error) {
    return next(new myError("XAMPP Error: Failed to connect to database", 500));
  }

  try {
    // Query to check if the user is connected to the specified alumni
    const query = `
    SELECT *
    FROM alumni_connect ac
    INNER JOIN user u ON (ac.alumni_id = u.id OR ac.uid = u.id)
    WHERE (ac.uid = ? OR ac.alumni_id = ?) 
      AND ac.approval = "1" 
      AND u.id != ?; -- Exclude the current user
`;

// Execute the query
const [result] = await connection.execute(query, [uid, uid, uid]);
console.log(result);

    connection.end();
    res.status(200).json(result);
  } catch (error) {
    connection.end(); // Close connection on error
    return next(new myError(error.message, 500));
  }
};

const getPendingPosts = async (req, res, next) => {
  const uid = req.user.id;
  console.log("Current User ID (uid):", uid); // Log the uid for debugging


  let connection;
  try {
    connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      database: "project",
    });
  } catch (error) {
    return next(new myError("XAMPP Error: Failed to connect to database", 500));
  }

  try {
    // Query to check if the user is connected to the specified alumni
    const query = `
      SELECT u.*, d.name AS department_name
FROM alumni_connect ac
INNER JOIN user u ON ac.alumni_id = u.id
INNER JOIN department d ON u.department_id = d.id
WHERE ac.uid = ? AND ac.approval = "0";

    `;

    // Execute the query
    const [result] = await connection.execute(query, [uid]);
console.log(result);
    connection.end();
    res.status(200).json(result);
  } catch (error) {
    connection.end(); // Close connection on error
    return next(new myError(error.message, 500));
  }
};


const getConnectingPosts = async (req, res, next) => {
  const uid = req.user.id;
  console.log("Current User ID (uid):", uid); // Log the uid for debugging


  let connection;
  try {
    connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      database: "project",
    });
  } catch (error) {
    return next(new myError("XAMPP Error: Failed to connect to database", 500));
  }

  try {
    // Query to check if the user is connected to the specified alumni
    const query = `
      SELECT u.*, d.name AS department_name
FROM alumni_connect ac
INNER JOIN user u ON ac.uid = u.id
INNER JOIN department d ON u.department_id = d.id
WHERE ac.alumni_id = ? AND ac.approval = "0";

    `;

    // Execute the query
    const [result] = await connection.execute(query, [uid]);
console.log(result);
    connection.end();
    res.status(200).json(result);
  } catch (error) {
    connection.end(); // Close connection on error
    return next(new myError(error.message, 500));
  }
};


const addSuccessStories = async (req, res, next) => {
  let connection;
  const uid = req.user.id; // Get user ID from the authenticated user
  const { formData } = req.query; // Get alumni ID and message
  const title = formData.title;
  const description = formData.description;
  const image = formData.imagePreviews;

  // Logging the inputs for debugging purposes
  // console.log(uid);
  console.log(title);
  console.log(description);
  console.log(image);
  // console.log(formData);

  // Check for null or undefined values
  if (!uid || !title || !description || !image) {
    return next(new myError("All fields are required.", 400));
  }

  try {
    // Establish connection to the MySQL database
    connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      database: "project",
    });
  } catch (error) {
    return next(new myError("XAMPP Error: Failed to connect to database", 500));
  }

  try {
    // Query to insert the success story
    let query = `
      INSERT INTO success_stories (uid, title, description, image_url) 
      VALUES (?, ?, ?, ?)
    `;

    // Execute the query
    const [result] = await connection.execute(query, [uid, title, description, image]);
console.log (result);

    // Send a success response with a message
    res.status(200).json({ message: "Success story added successfully!" });
  } catch (error) {
    console.error("Error adding success story:", error.message); // Log the error message
    return next(new myError(error.message, 500));
  } finally {
    // Ensure the connection is closed
    if (connection) {
      await connection.end(); // Ensure to close the connection
    }
  }
};

const postAcceptRequest = async (req, res, next) => {
  let connection;
  const uid = req.user.id; // Get user ID from the authenticated user
  const { id } = req.query; // Get alumni ID

  console.log("user id", uid);
  console.log("alumni id", id);

  try {
    // Establish connection to the MySQL database
    connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      database: "project",
    });
  } catch (error) {
    return next(new myError("XAMPP Error: Failed to connect to database", 500));
  }

  try {
    // Query to update the approval status for an existing connection
    const updateQuery = `
      UPDATE alumni_connect
      SET approval = 1
      WHERE uid = ? AND alumni_id = ?
    `;

    // Execute the update query
    const [result] = await connection.execute(updateQuery, [ id,uid]);
console.log(result);
    // Check if any rows were affected (meaning the update was successful)
    if (result.affectedRows === 0) {
      return res.status(400).json({ message: "No connection found to approve." });
    }

    // Send a success response with a message
    return res.status(200).json({ message: "Connection request accepted successfully!" });
  } catch (error) {
    console.error("Error handling connection request:", error.message); // Log the error message
    return next(new myError(error.message, 500));
  } finally {
    // Ensure the connection is closed
    if (connection) {
      await connection.end(); // Ensure to close the connection
    }
  }
};

const postDeclineRequest = async (req, res, next) => {
  let connection;
  const uid = req.user.id; // Get user ID from the authenticated user
  const { id } = req.query; // Get alumni ID

  // console.log("user id", uid);
  // console.log("alumni id", id);

  try {
    // Establish connection to the MySQL database
    connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      database: "project",
    });
  } catch (error) {
    return next(new myError("XAMPP Error: Failed to connect to database", 500));
  }

  try {
    // Query to update the approval status for an existing connection
    const updateQuery = `
       DELETE FROM alumni_connect 
    WHERE (uid = ? AND alumni_id = ?) OR (uid = ? AND alumni_id = ?);
    `;

    // Execute the update query
    const [result] = await connection.execute(updateQuery, [ id,uid,uid,id]);
console.log(result);
    // Check if any rows were affected (meaning the update was successful)
    if (result.affectedRows === 0) {
      return res.status(400).json({ message: "No connection found to approve." });
    }

    // Send a success response with a message
    return res.status(200).json({ message: "Connection request accepted successfully!" });
  } catch (error) {
    console.error("Error handling connection request:", error.message); // Log the error message
    return next(new myError(error.message, 500));
  } finally {
    // Ensure the connection is closed
    if (connection) {
      await connection.end(); // Ensure to close the connection
    }
  }
};

const getConnectedAlumniList = async (req, res, next) => {
  const uid = req.user.id;
  console.log("Current User ID (uid):", uid); // Log the uid for debugging


  let connection;
  try {
    connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      database: "project",
    });
  } catch (error) {
    return next(new myError("XAMPP Error: Failed to connect to database", 500));
  }

  try {
    // Query to check if the user is connected to the specified alumni
    const query = `
      SELECT u.*, d.name AS department_name
FROM alumni_connect ac
INNER JOIN user u ON ac.alumni_id = u.id
INNER JOIN department d ON u.department_id = d.id
WHERE ac.uid = ? AND ac.approval = "1";

    `;

    // Execute the query
    const [result] = await connection.execute(query, [uid]);
console.log(result);
    connection.end();
    res.status(200).json(result);
  } catch (error) {
    connection.end(); // Close connection on error
    return next(new myError(error.message, 500));
  }
};

module.exports = {
  getPosts,
  getStories,
  connectRequest,
  getConnectionCheck,
  getPendingConnectionCheck,
  getConnectedPosts,
  getPendingPosts,
  getConnectingPosts,
  addSuccessStories,
  postAcceptRequest,
  getAcceptCheck,
  postDeclineRequest,
  getConnectedAlumniList,
};
