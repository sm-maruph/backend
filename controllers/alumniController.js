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
    const parameters = [uid];  // Array to hold dynamic parameters

    // Add conditions based on the presence of parameters
    if (searchQuery) {
      conditions.push(`(u.first_name LIKE ? OR u.last_name LIKE ? OR u.company LIKE ?)`);
      parameters.push(`%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`);
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
      query += ` AND ` + conditions.join(' AND ');
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


module.exports = {
  getPosts,
  getStories,
};
