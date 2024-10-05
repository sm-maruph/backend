const { v4: uuidv4 } = require("uuid");
const mysql = require("mysql2/promise");
const { myError } = require("../middlewares/errorMiddleware");

const getPosts = async (req, res, next) => {
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
    let query = `SELECT * FROM market_items WHERE 1`;

    // If a specific category is selected, add it to the query
    // if (selectedCategory !== "Any") {
    //   query += " AND category = ?";
    // }

    // query += " ORDER BY price ASC"; // Sort by price in ascending order

    // // Prepare the query parameters
    // const params = [`${searchQuery}%`, parseInt(minPrice), parseInt(maxPrice)];
    // if (selectedCategory !== "Any") {
    //   params.push(selectedCategory);
    // }

    // console.log("Executing Query:", query, params);

    // Execute the query with bind parameters
    const [result] = await connection.execute(query);

    console.log("Query Result:", result); // Log the query result

    connection.end();

    // Send a success response with the filtered and sorted data
    res.status(200).json(result);
  } catch (error) {
    return next(new myError(error.message, 500));
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
    res.status(200).json({ message: "Mission successful", data: result });
  } catch (error) {
    return next(new myError(error.message, 500));
  }
};

const addPost = async (req, res, next) => {
  let { title, description, price, category, condition, address } = req.body;
  category = Number(category);
  const uid = req.user.id;
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
      query = `INSERT INTO market_items (id, uid, category_id, title, description, price, item_condition, image_url, address) 
VALUES (?, ?, ?, ?, ?, ?, ?, ?,?)
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
      ];
    } else {
      query = `INSERT INTO market_items (id, uid, category_id, title, description, price, item_condition,  address) 
      VALUES (?, ?, ?, ?, ?, ?, ?,?)
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
  const uid = req.user.id;
  const pid = req.params.id;

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
    // Construct the query to delete the post
    const query = `DELETE FROM marketplace WHERE pid = ? AND uid = ?`;

    // Execute the query with the post ID and user ID as parameters
    const [result] = await connection.execute(query, [pid, uid]);

    // Check if the post was deleted
    if (result.affectedRows === 0) {
      return next(new myError("Post not found or not authorized", 404));
    }

    // Close the connection
    connection.end();

    // Send a success response
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    return next(new myError(error.message, 500));
  }
};

const getContacts = async (req, res, next) => {
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
    const uid = req.params.uid; // Assuming you're passing the user's ID as a URL parameter

    let query = `
      SELECT id, first_name, last_name, email, profile_picture, gender, user_type 
      FROM user 
      WHERE id = ?
    `;

    const [result] = await connection.execute(query, [uid]);

    await connection.end();

    res.status(200).json({ message: "Mission successful", data: result });
  } catch (error) {
    return next(new myError(error.message, 500));
  }
};

module.exports = {
  getPosts,
  addPost,
  getMyListings,
  updatePost,
  deletePost,
  getContacts,
};
