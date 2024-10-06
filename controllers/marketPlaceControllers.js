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

const getMyListings = async (req, res, next) => {
  const uid = req.user.id;
  console.log(uid);

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
      SELECT id,pid, uid, name, content, category, price, image, timestamp FROM marketplace
      WHERE uid = ?
    `;

    // Execute the query with the uid as a parameter
    const [result] = await connection.execute(query, [uid]);
    console.log(result);
    // Close the connection
    await connection.end();

    // Send a success response with the filtered and sorted data
    res.status(200).json(result);
  } catch (error) {
    return next(new myError(error.message, 500));
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

const updatePost = async (req, res, next) => {
  console.log("reached");
  const { pid, title, content, price, category } = req.body;
  console.log(pid);
  const uid = req.user.id;
  let imagesUrl;

  if (req.file) {
    imagesUrl = req.file.path;
  }

  console.log(title, content, price, category);

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

  try {
    let query;
    let params;

    if (imagesUrl) {
      query = `UPDATE marketplace SET name = ?, content = ?, category = ?, price = ?, image = ? WHERE pid = ? AND uid = ?`;
      params = [title, content, category, price, imagesUrl, pid, uid];
    } else {
      query = `UPDATE marketplace SET name = ?, content = ?, category = ?, price = ? WHERE pid = ? AND uid = ?`;
      params = [title, content, category, price, pid, uid];
    }

    const [results, fields] = await connection.query(query, params);
    connection.end();
    res.status(200).send({ message: "Post updated successfully" });
  } catch (error) {
    return next(new myError(error.message, 500));
  }
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

module.exports = {
  getMarketItems,
  getProductInfo,
  addPost,
  updatePostStatusToSold,
  getMyListings,
  updatePost,
  deletePost,
};
