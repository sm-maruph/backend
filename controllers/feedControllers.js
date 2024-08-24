const { v4: uuidv4 } = require("uuid");
const mysql = require("mysql2/promise");
const { myError } = require("../middlewares/errorMiddleware");

const feedPost = async (req, res, next) => {
  const { title, description } = req.body;
  const uid = req.user.id;
  let jsonObject;
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
    return next(new myError("Xammp Server Error", 500));
  }

  const id = uuidv4();
  try {
    if (req.files) {
      let [results, field] = await connection.query(
        `INSERT INTO student_feed_post(id, uid, content, image_url, title) VALUES (?,?,?,?,?)`,
        [id, uid, description, imagesUrl, title]
      );
    } else {
      let [results, field] = await connection.query(
        `INSERT INTO student_feed_post(id, uid, content, title) VALUES (?,?,?,?)`,
        [id, uid, description, title]
      );
    }
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

    const updated = results.map((item) => {
      return { ...item, image_url: JSON.parse(item.image_url) };
    });

    return res.json({ posts: updated }).status(200);
  } catch (error) {
    return next(new myError(error.message, 500));
  }
};

const feedLikes = async (req, res, next) => {
  const { postId, isLiked } = req.body;
  const { id: userId } = req.user;
  console.log(req.body);
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

  const id = uuidv4();
  try {
    await connection.query(
      "INSERT INTO student_feed_post_likes (id,uid, pid, is_liked) VALUES (?, ?, ?,?) ON DUPLICATE KEY UPDATE is_liked = VALUES(is_liked)",
      [id, userId, postId, isLiked]
    );
    return res.status(200).send({ message: "Mission Successful.." });
  } catch (error) {
    console.log("database Error");
    return next(new myError(error.message, 500));
  }
};

const getLikes = async (req, res, next) => {
  const postId = req.params.postId;
  const userId = req.user.id;
  console.log(userId);

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
    const [likes] = await connection.query(
      "SELECT COUNT(*) AS COUNT FROM student_feed_post_likes where pid = ? AND is_liked = 'like'",
      [postId]
    );
    const [disLikes] = await connection.query(
      "SELECT COUNT(*) AS COUNT FROM student_feed_post_likes where pid = ? AND is_liked = 'dislike'",
      [postId]
    );
    const [UR] = await connection.query(
      `SELECT id, uid, pid, created_at, is_liked FROM student_feed_post_likes WHERE pid = '${postId}' AND uid = '${userId}'`
    );
    console.log(UR);
    if (UR.length !== 0) {
      return res.status(200).json({
        likes: likes[0].COUNT,
        disLikes: disLikes[0].COUNT,
        userReaction: UR[0].is_liked,
      });
    } else {
      return res.status(200).json({
        likes: likes[0].COUNT,
        disLikes: disLikes[0].COUNT,
        userReaction: null,
      });
    }
  } catch (error) {
    return next(new myError(error.message, 500));
  }
};
module.exports = { feedPost, getPosts, feedLikes, getLikes };
