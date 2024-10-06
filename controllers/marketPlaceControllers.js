const { v4: uuidv4 } = require("uuid");
const mysql = require("mysql2/promise");
const { myError } = require("../middlewares/errorMiddleware");

// Controller to get filtered market items
const getMarketItems = async (req, res) => {
  try {
    // Destructure the query parameters
    const { title, category_id, min_price, max_price } = req.query;

    // Create MySQL connection
    const connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      database: "project", // Replace with your actual database name
      password: "", // Add password if required
    });

    // Initialize the base query
    let query = 'SELECT * FROM market_items WHERE status = "available"';
    let queryParams = [];

    // Check for filters and build the query dynamically
    if (title) {
      query += " AND title LIKE ?";
      queryParams.push(`%${title}%`);
    }

    if (category_id) {
      query += " AND category_id = ?";
      queryParams.push(category_id);
    }

    if (min_price && max_price) {
      query += " AND price BETWEEN ? AND ?";
      queryParams.push(min_price, max_price);
    } else if (min_price) {
      query += " AND price >= ?";
      queryParams.push(min_price);
    } else if (max_price) {
      query += " AND price <= ?";
      queryParams.push(max_price);
    }

    // Execute the query
    const [rows] = await connection.execute(query, queryParams);

    // Format the image_url field (which is stored as a JSON string)
    const formattedRows = rows.map((item) => {
      item.image_url = JSON.parse(item.image_url); // Parse the image URLs from JSON string
      return item;
    });

    // Close connection after query execution
    await connection.end();

    // Send the result as response
    res.json(formattedRows);
  } catch (error) {
    console.error("Error fetching market items:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Controller to get individual product information
const getProductInfo = async (req, res) => {
  try {
    // Get the product ID from the request parameters
    const { id } = req.query;

    // Create MySQL connection
    const connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      database: "project", // Replace with your actual database name
      password: "", // Add password if required
    });

    // SQL query to join market_items and market_categories and get individual product info
    const query = `
      SELECT mi.*, u.first_name as first_name,u.last_name as last_name,u.profile_picture , mc.category_name
      FROM market_items as mi 
      JOIN user as u
      JOIN market_categories as mc ON mi.category_id = mc.category_id
      WHERE mi.id = ?
    `;

    // Execute the query with the product ID
    const [rows] = await connection.execute(query, [id]);

    // Close connection after query execution
    await connection.end();

    // Check if the product exists
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found or inactive.",
      });
    }

    // Format the image_url field (which is stored as a JSON string)
    const product = rows[0];
    product.image_url = JSON.parse(product.image_url); // Parse the image URLs from JSON string

    // Format the created_at date
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    };

    product.created_at = new Intl.DateTimeFormat("en-US", options).format(
      new Date(product.created_at)
    );

    // Send the product data as response
    res.json(product);
  } catch (error) {
    console.error("Error fetching product info:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const addPost = async (req, res, next) => {
  let { title, description, price, category, condition, address, phone } =
    req.body;
  const { uid } = req.query;
  category = Number(category);
  // const uid = req.user.id;
  let imagesUrl;

  if (req.files) {
    jsonObject = req.files.map((file) => file.path);

    imagesUrl = JSON.stringify(jsonObject);
  }

  let connection;
  try {
    connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      database: "project",
    });
  } catch (err) {
    return next(new myError("XAMPP Server Error", 500));
  }

  const id = uuidv4();
  try {
    let query;
    let params;

    if (imagesUrl) {
      query = `INSERT INTO market_items (id, uid, category_id, title, description, price, item_condition, image_url, address,phone) 
VALUES (?, ?, ?, ?, ?, ?, ?, ?,?,?)
`;
      params = [
        id,
        uid,
        category,
        title,

        description,
        price,
        condition,
        imagesUrl,
        address,
        phone,
      ];
    } else {
      query = `INSERT INTO market_items (id, uid, category_id, title, description, price, item_condition,  address,phone) 
      VALUES (?, ?, ?, ?, ?, ?, ?,?,?)
      `;
      params = [
        id,
        uid,

        category,
        title,
        description,
        price,
        condition,
        imagesUrl,
        address,
        phone,
      ];
    }

    const [results, fields] = await connection.query(query, params);
    connection.end();
    res.status(201).send({ message: "Post successful" });
  } catch (error) {
    return next(new myError(error.message, 500));
  }
  res.status(200);
};

const deletePost = async (req, res, next) => {
  const { itemId: postId, uid } = req.query; // Assume postId is passed as a query parameter

  console.log("Delete Post Request:", uid, postId); // Logging the request

  let connection;
  try {
    // Establish the MySQL connection
    connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      database: "project",
    });
  } catch (err) {
    return next(new myError("XAMPP Server Error", 500));
  }

  try {
    // Prepare the delete query
    const query = `DELETE FROM market_items WHERE id = ? AND uid = ?`;
    const params = [postId, uid]; // Ensure that the user can only delete their own posts

    // Execute the delete query
    const [results] = await connection.query(query, params);

    if (results.affectedRows === 0) {
      // No rows affected means the post doesn't exist or the user is not the owner
      return res.status(404).send({
        message:
          "Post not found or you are not authorized to delete this post.",
      });
    }

    // Close the connection and send a success response
    connection.end();
    res.status(200).send({ message: "Post deleted successfully." });
  } catch (error) {
    return next(new myError(error.message, 500));
  } finally {
    if (connection) {
      await connection.end(); // Ensure the connection is closed in case of an error
    }
  }
};

const updatePostStatusToSold = async (req, res, next) => {
  const { itemId: postId, uid } = req.query; // Assume postId is passed as a route parameter

  console.log("update Sold", uid, postId); // Get the user ID from the authenticated request

  let connection;
  try {
    // Establish the MySQL connection
    connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      database: "project",
    });
  } catch (err) {
    return next(new myError("XAMPP Server Error", 500));
  }

  try {
    // Prepare the update query
    const query = `UPDATE market_items SET status = ? WHERE id = ? AND uid = ?`;
    const params = ["sold", postId, uid]; // Ensure that the user can only update their own posts

    // Execute the update query
    const [results] = await connection.query(query, params);

    if (results.affectedRows === 0) {
      // No rows affected means the post doesn't exist or the user is not the owner
      return res.status(404).send({
        message:
          "Post not found or you are not authorized to update this post.",
      });
    }

    // Close the connection and send a success response
    connection.end();
    res.status(200).send({ message: "Post status updated to sold." });
  } catch (error) {
    return next(new myError(error.message, 500));
  }
};
const getUserBookmarks = async (req, res, next) => {
  const uid = req.user.id; // Get the user ID from the authenticated request

  let connection;
  try {
    // Establish MySQL connection
    connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      database: "project",
    });
  } catch (err) {
    return next(new myError("XAMPP Server Error", 500));
  }

  try {
    // Query to get bookmarked posts by the user
    const query = `
      SELECT market_items.*
      FROM bookmark
      JOIN market_items
      ON bookmark.market_id = market_items.id
      WHERE bookmark.uid = ?
    `;

    const [results] = await connection.query(query, [uid]);

    connection.end();

    if (results.length === 0) {
      return res.status(404).send({ message: "No bookmarks found." });
    }

    res.status(200).send(results);
  } catch (error) {
    return next(new myError(error.message, 500));
  }
};

const addBookmark = async (req, res, next) => {
  const { marketId } = req.body; // The ID of the post to be bookmarked
  const uid = req.user.id; // Get the user ID from the authenticated request

  let connection;
  try {
    // Establish MySQL connection
    connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      database: "project",
    });
  } catch (err) {
    return next(new myError("XAMPP Server Error", 500));
  }

  try {
    // Check if the bookmark already exists
    const checkQuery = `SELECT * FROM bookmark WHERE uid = ? AND market_id = ?`;
    const [checkResult] = await connection.query(checkQuery, [uid, marketId]);

    if (checkResult.length > 0) {
      return res.status(400).send({ message: "Bookmark already exists." });
    }

    // Query to insert a new bookmark
    const query = `INSERT INTO bookmark (id, uid, market_id) VALUES (?, ?, ?)`;
    const bookmarkId = uuidv4(); // Generate a new UUID for the bookmark

    await connection.query(query, [bookmarkId, uid, marketId]);

    connection.end();

    res.status(201).send({ message: "Bookmark added successfully." });
  } catch (error) {
    return next(new myError(error.message, 500));
  }
};
const deleteBookmark = async (req, res, next) => {
  const { marketId } = req.params; // The ID of the post to be unbookmarked
  const uid = req.user.id; // Get the user ID from the authenticated request

  let connection;
  try {
    // Establish MySQL connection
    connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      database: "project",
    });
  } catch (err) {
    return next(new myError("XAMPP Server Error", 500));
  }

  try {
    // Query to delete the bookmark
    const query = `DELETE FROM bookmark WHERE uid = ? AND market_id = ?`;
    const [result] = await connection.query(query, [uid, marketId]);

    connection.end();

    if (result.affectedRows === 0) {
      return res.status(404).send({ message: "Bookmark not found." });
    }

    res.status(200).send({ message: "Bookmark deleted successfully." });
  } catch (error) {
    return next(new myError(error.message, 500));
  }
};
const getAllUserPosts = async (req, res, next) => {
  const { id: uid } = req.query; // Assuming you're using some authentication middleware to get the logged-in user's ID

  let connection;
  try {
    // Establishing connection to MySQL database
    connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      database: "project", // Replace with your actual database name
    });
  } catch (err) {
    return next(new myError("XAMPP Server Error", 500));
  }

  try {
    // Query to get all posts for the specific user
    const query = `
      SELECT *
      FROM market_items
      WHERE uid = ?
    `;

    const [results] = await connection.execute(query, [uid]);
    const formattedRows = results.map((item) => {
      item.image_url = JSON.parse(item.image_url); // Parse the image URLs from JSON string
      return item;
    });

    // Closing the connection
    connection.end();

    // If no posts found, return a message
    if (results.length === 0) {
      return res.status(404).json({ message: "No posts found for this user." });
    }

    // Return all the user's posts
    res.status(200).json(formattedRows);
  } catch (error) {
    return next(new myError(error.message, 500));
  }
};

const updateProduct = async (req, res, next) => {
  const { title, description, phone, price, condition, address } = req.body; // Destructure fields from the request body
  const { id } = req.query; // Get the product ID from the request parameters

  // Validate that at least one field is provided
  if (!title && !description && !phone && !price && !condition && !address) {
    return res
      .status(400)
      .json({ message: "At least one field is required to update." });
  }

  let connection;
  try {
    // Establishing connection to MySQL database
    connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      database: "project", // Replace with your actual database name
    });

    // Create an array to hold the fields and values for the query
    const fields = [];
    const values = [];

    // Check which fields are provided and build the update query
    if (title) {
      fields.push("title = ?");
      values.push(title);
    }
    if (description) {
      fields.push("description = ?");
      values.push(description);
    }
    if (phone) {
      fields.push("phone = ?");
      values.push(phone);
    }
    if (price) {
      fields.push("price = ?");
      values.push(price);
    }
    if (condition) {
      fields.push("item_condition = ?");
      values.push(condition);
    }
    if (address) {
      fields.push("address = ?");
      values.push(address);
    }

    // Add the ID to the end of the values array
    values.push(id);

    // Construct the query
    const query = `
      UPDATE market_items 
      SET ${fields.join(", ")} 
      WHERE id = ?
    `;

    const [result] = await connection.query(query, values); // Execute the query

    // Check if the product was found and updated
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Product not found." });
    }

    // Successfully updated
    res.status(200).json({ message: "Product updated successfully." });
  } catch (error) {
    console.error("Error updating product:", error);
    return next(new myError("Internal server error.", 500)); // Handle any errors
  } finally {
    if (connection) {
      await connection.end(); // Ensure the connection is closed
    }
  }
};
module.exports = {
  getMarketItems,
  getProductInfo,
  addPost,
  updatePostStatusToSold,
  deletePost,
  getUserBookmarks,
  addBookmark,
  deleteBookmark,
  getAllUserPosts,
  updateProduct,
};
