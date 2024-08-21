const { v4: uuidv4 } = require("uuid");
const mysql = require("mysql2/promise");
const { myError } = require("../middlewares/errorMiddleware");

const feedPost = async (req, res, next) => {
  const { title, description } = req.body;
  const uid = req.user.id;
  const jsonObject = req.files.map((file) => file.path);

  const imagesUrl = JSON.stringify(jsonObject);

  let connection;
  try {
    console.log("hello");
    connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      database: "project",
    });
  } catch (err) {
    return next(new myError("Xammp Server Error", 500));
  }

  const id = uuidv4();
  try {
    let [results, field] = await connection.query(
      `INSERT INTO student_feed_post(id, uid, content, image_url, title) VALUES (?,?,?,?,?)`,
      [id, uid, description, imagesUrl, title]
    );
  } catch (error) {
    return next(new myError(error.message, 500));
  }

  res.status(201).send({ message: "Post successfull" });
};

const getPosts = async (req, res, next) => {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      database: "project",
    });
  } catch (err) {
    return next(new myError("Xammp Server Error", 500));
  }

  try {
    let [results, field] = await connection.query(
      `SELECT sfp.id,sfp.uid,sfp.content,sfp.image_url,sfp.created_at,sfp.title,u.profile_picture,u.first_name,u.last_name
FROM student_feed_post as sfp 
JOIN user as u ON sfp.uid = u.id;`
    );
    return res.json({ posts: results }).status(200);
  } catch (error) {
    return next(new myError(error.message, 500));
  }
};
module.exports = { feedPost, getPosts };
