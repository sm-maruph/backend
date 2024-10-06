const mysql = require("mysql2/promise");
const { myError } = require("../middlewares/errorMiddleware");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const getToLet = async (req, res, next) => {
  let connection;
  try {
    // Establishing MySQL connection
    connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      database: "project",
    });
  } catch (err) {
    return next(new myError("Database connection error", 500)); // Use myError for database connection error
  }

  // Extract filter criteria from request body
  const { search, location, rent_type, minAmount, maxAmount } = req.query;

  // Base query
  let query = "SELECT * FROM tolet";
  let queryParams = [];
  let conditions = [];

  // Search filter
  if (search) {
    conditions.push("(location LIKE ? OR description LIKE ?)");
    queryParams.push(`%${search}%`, `%${search}%`);
  }

  // Location filter
  if (location) {
    conditions.push("location LIKE ?");
    queryParams.push(`%${location}%`);
  }

  // Rent type filter
  if (rent_type && rent_type.length > 0) {
    conditions.push("rent_type IN (?)");
    queryParams.push(rent_type);
  }

  // Min amount filter
  if (minAmount) {
    conditions.push("amount >= ?");
    queryParams.push(minAmount);
  }

  // Max amount filter
  if (maxAmount) {
    conditions.push("amount <= ?");
    queryParams.push(maxAmount);
  }

  // Add conditions to query
  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }

  console.log(query, queryParams); // Debugging

  try {
    // Execute the query
    const [rows] = await connection.query(query, queryParams);
    connection.end();

    // Send the result
    return res.status(200).json(rows);
  } catch (err) {
    return next(new myError("Database Query Failed", 500)); // Use myError for query failure
  }
};

const postTolet = async (req, res, next) => {
  const {
    location,
    rentType,
    gender,
    amount,
    description,
    facilities,
    requirements,
    roomDecorations,
    mediaName,
    mediaLink,
  } = req.body;
  const uid = req.user.id; // Assuming this is coming from your authentication middleware
  const imageFiles = req.files; // Array of uploaded image files

  // Construct image URLs from the uploaded files
  const imageUrls = imageFiles.map(
    (file) => `${req.protocol}://${req.get("host")}/tolet/${file.filename}`
  );

  let connection;
  try {
    // Establishing database connection
    connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      database: "project", // Replace with your actual database name
    });
  } catch (err) {
    console.error("Database Connection Error:", err.message);
    return next(new myError("Database connection failed", 500));
  }

  try {
    // Insert the tolet data into the database
    const query = `
      INSERT INTO tolet (uid, location, rent_type, Gender, amount, facility, room_decoration, requirement, description, image, media, media_name)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      uid,
      location,
      rentType,
      gender,
      amount,
      JSON.stringify(facilities), // Store as JSON array
      JSON.stringify(roomDecorations), // Store as JSON array
      JSON.stringify(requirements), // Store as JSON array
      description,
      JSON.stringify(imageUrls), // Store image URLs as JSON array
      mediaLink,
      mediaName,
    ];

    // Execute the query
    const [result] = await connection.query(query, values);

    // Close the connection after the query execution
    await connection.end();

    // Send a success response
    res
      .status(201)
      .json({ message: "Tolet entry created successfully!", data: result });
  } catch (error) {
    console.error("Database Insert Error:", error.message);
    console.error("Full Error Object:", error); // Log full error for debugging

    // Close the connection if there is an error
    if (connection) await connection.end();

    // Return error response
    return next(new myError("Database insert failed", 500));
  }
};

const myTolet = async (req, res, next) => {
  const uid = req.user.id;
  let connection;

  try {
    // Establish MySQL connection
    connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      database: "project",
    });
  } catch (err) {
    return next(new myError("Database connection error", 500)); // Use myError for database connection error
  }

  // Correct query with uid filter
  const query = "SELECT * FROM tolet WHERE uid = ?";

  try {
    // Execute the query and pass the uid as a parameter
    const [rows] = await connection.query(query, [uid]);
    connection.end();

    // Send the result
    return res.status(200).json(rows);
  } catch (err) {
    return next(new myError("Database Query Failed", 500)); // Use myError for query failure
  }
};

const getDetails = async (req, res, next) => {
  const { id } = req.params; // Get the ID from URL params
  console.log(id);

  let connection;

  try {
    // Establish MySQL connection
    connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      database: "project",
    });
  } catch (err) {
    return next(new myError("Database connection error", 500));
  }

  // Correct query using the ID from params
  const query =
    "SELECT t.*, u.profile_picture, u.first_name, u.last_name FROM tolet t JOIN user u ON t.uid = u.id WHERE t.id = ?";

  try {
    // Execute the query and pass the id as a parameter
    const [rows] = await connection.query(query, [id]);
    connection.end();

    if (rows.length === 0) {
      return res.status(404).json({ message: "No tolet found with this ID" });
    }

    // Send the result
    return res.status(200).json(rows[0]); // Send the first result
  } catch (err) {
    return next(new myError("Database Query Failed", 500));
  }
};

// Controller function to delete a tolet by ID
const deleteTolet = async (req, res, next) => {
  const { id } = req.params; // Get the ID from URL params
  let connection;

  try {
    // Establish MySQL connection
    connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      database: "project",
    });
  } catch (err) {
    return next(new myError("Database connection error", 500));
  }

  try {
    // Query to delete the tolet entry by ID
    const query = "DELETE FROM tolet WHERE id = ?";

    // Execute the query, passing the ID as a parameter
    const [result] = await connection.query(query, [id]);
    connection.end();

    if (result.affectedRows === 0) {
      // If no rows were affected, that means no matching entry was found
      return res.status(404).json({ message: "ToLet entry not found" });
    }

    // If successful, send a response
    return res
      .status(200)
      .json({ message: "ToLet entry deleted successfully" });
  } catch (err) {
    return next(new myError("Failed to delete ToLet entry", 500));
  }
};

const insertBookmark = async (req, res, next) => {
  const { tid } = req.body; // Get `tid` (tolet ID) from the request body
  const uid = req.user.id; // Get `uid` from `req.user` (assumed to be set by authentication middleware)
  let connection;

  try {
    // Establish MySQL connection
    connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      database: "project",
    });

    // Query to insert a new bookmark entry
    const query = "INSERT INTO saved_tolet (uid, tid) VALUES (?, ?)";

    // Execute the query, passing `uid` and `tid` as parameters
    const [result] = await connection.query(query, [uid, tid]);

    // Close the connection after the query is executed
    await connection.end();

    // Check if insertion was successful
    if (result.affectedRows === 0) {
      return res.status(400).json({ message: "Failed to save bookmark" });
    }

    // If successful, send a response
    return res.status(201).json({ message: "Bookmark saved successfully" });
  } catch (err) {
    if (connection) {
      await connection.end(); // Ensure the connection is closed in case of error
    }
    return next(new myError("Failed to save bookmark", 500));
  }
};

const getBookmark = async (req, res, next) => {
  const userId = req.user.id; // Assuming req.user is populated after authentication

  let connection;

  try {
    // Establish the database connection
    connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      database: "project",
    });

    // Query to get all saved ToLet entries for the user from the 'saved_tolet' table
    const bookmarkQuery = `
      SELECT 
    st.id AS bid,  
    t.*            
    FROM 
    saved_tolet st
    JOIN 
    tolet t 
    ON 
    st.tid = t.id
    WHERE 
    st.uid = ?`;

    // Execute the query and get the results
    const [results] = await connection.execute(bookmarkQuery, [userId]);

    // Close the connection
    connection.end();

    // Return the results as a response
    return res.status(200).json(results);
  } catch (err) {
    // Handle any errors
    console.error("Error fetching bookmarks:", err);
    return next(new myError("Failed to fetch bookmarked ToLet entries", 500));
  }
};

const deleteBookmark = async (req, res, next) => {
  const { bid } = req.params; // Get bookmark ID from the URL params
  
  console.log(bid);
  
  let connection;

  try {
    // Establish MySQL connection
    connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      database: "project",
    });
  } catch (err) {
    return res.status(500).json({ message: "Database connection error" });
  }

  try {
    // Query to delete the bookmark by its ID (from saved_tolet table)
    const query = "DELETE FROM saved_tolet WHERE id = ?";
    
    // Execute the query with the bookmark ID as a parameter
    const [result] = await connection.query(query, [bid]);
    connection.end();

    if (result.affectedRows === 0) {
      // If no rows were affected, that means no matching bookmark was found
      return res.status(404).json({ message: 'Bookmark not found' });
    }

    // Send success response if the deletion was successful
    return res.status(200).json({ message: 'Bookmark deleted successfully' });
  } catch (err) {
    return res.status(500).json({ message: "Failed to delete bookmark" });
  }
};

const updateTolet = async (req, res, next) => {
  const { tid } = req.params; // Get tolet ID from the URL params
  const {
    location,
    rentType,
    gender,
    amount,
    facility,
    requirement,
    roomDecoration,
    description,
    mediaLink,
    mediaName,
  } = req.body;

  console.log(mediaName); // Log tolet ID for debugging

  let connection;

  try {
    // Establish MySQL connection
    connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      database: "project",
    });
  } catch (err) {
    return res.status(500).json({ message: "Database connection error" });
  }

  try {
    // Query to update the tolet by its ID
    const query = `
      UPDATE tolet 
      SET 
        location = ?, 
        rent_type = ?, 
        Gender = ?, 
        amount = ?, 
        facility = ?, 
        requirement = ?, 
        room_decoration = ?, 
        description = ?, 
        media = ?, 
        media_name = ?
      WHERE id = ?
    `;

    // Execute the query with the new data and the tolet ID
    const [result] = await connection.query(query, [
      location,
      rentType,
      gender,
      amount,
      JSON.stringify(facility), // Convert arrays to JSON strings for MySQL
      JSON.stringify(requirement),
      JSON.stringify(roomDecoration),
      description,
      mediaLink,
      mediaName,
      tid, // tolet ID
    ]);

    connection.end(); // Close the database connection

    if (result.affectedRows === 0) {
      // If no rows were affected, that means no matching tolet entry was found
      return res.status(404).json({ message: 'Tolet entry not found' });
    }

    // Send success response if the update was successful
    return res.status(200).json({ message: 'Tolet entry updated successfully' });
  } catch (err) {
    return res.status(500).json({ message: "Failed to update tolet entry" });
  }
};


module.exports = {
  getToLet,
  postTolet,
  myTolet,
  getDetails,
  deleteTolet,
  insertBookmark,
  getBookmark,
  deleteBookmark,
  updateTolet
};
