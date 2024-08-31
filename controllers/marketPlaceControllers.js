const { v4: uuidv4 } = require("uuid");
const mysql = require("mysql2/promise");
const { myError } = require("../middlewares/errorMiddleware");

const getPosts = async (req, res, next) => {
  const user = req.user;
  const { searchQuery = "", selectedCategory = "Any", minPrice = 0, maxPrice = 50000 } = req.query; // Extract the query parameters from the request
  console.log(searchQuery);
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
    // Construct the query with filtering and sorting
    let query = `
      SELECT id, pid, uid, name, category, price, image, timestamp 
      FROM marketplace 
      WHERE 
        name LIKE ? AND 
        price BETWEEN ? AND ?
    `;

    // If a specific category is selected, add it to the query
    if (selectedCategory !== "Any") {
      query += " AND category = ?";
    }

    query += " ORDER BY price ASC"; // Sort by price in ascending order

    // Prepare the query parameters
    const params = [`${searchQuery}%`, minPrice, maxPrice];
    if (selectedCategory !== "Any") {
      params.push(selectedCategory);
    }
    console.log("Executing Query:", query, params);
    // Execute the query with the parameters
    const [result] = await connection.query(query, params);
    //console.log("Query Result:", result); // Log the query result
    connection.end();

    // Send a success response with the filtered and sorted data
    res.status(200).json({ message: "Mission successful", data: result });
  } catch (error) {
    return next(new myError(error.message, 500));
  }
};

module.exports = {
  getPosts,
};
