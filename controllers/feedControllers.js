const { v4: uuidv4 } = require("uuid");
const mysql = require("mysql2/promise");
const { myError } = require("../middlewares/errorMiddleware");
const moment = require("moment");

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
      connection.end();
    } else {
      let [results, field] = await connection.query(
        `INSERT INTO student_feed_post(id, uid, content, title) VALUES (?,?,?,?)`,
        [id, uid, description, title]
      );
      connection.end();
    }
  } catch (error) {
    return next(new myError(error.message, 500));
  }

  res.status(200).send({ message: "Post successfull" });
};

const feedComment = async (req, res, next) => {
  const postId = req.params.postId;
  const userId = req.user.id;
  const content = req.body.comment;
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
  } catch (error) {
    return next(new myError("xammp Error", 500));
  }
  const id = uuidv4();

  try {
    if (req.files) {
      let [results, field] = await connection.query(
        `INSERT INTO student_feed_post_comments (id, pid, uid,  content, image_url) VALUES (?,?,?,?,?)`,
        [id, postId, userId, content, imagesUrl]
      );
      connection.end();
    } else {
      let [results, field] = await connection.query(
        `INSERT INTO student_feed_post_comments (id, pid, uid,  content) VALUES (?,?,?,?)`,
        [id, postId, userId, content]
      );
      connection.end();
    }
    res.status(200).json({ message: "comment successfull" });
  } catch (error) {
    return next(new myError(error.message, 500));
  }
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
JOIN user as u ON sfp.uid = u.id order by created_at DESC;`
    );
    connection.end();
    const updated = results.map((item) => {
      return {
        ...item,
        image_url: JSON.parse(item.image_url),
        created_at: moment(item.created_at).format("MMMM D, YYYY"),
      };
    });

    console.log(updated);
    return res.json({ posts: updated }).status(200);
  } catch (error) {
    return next(new myError(error.message, 500));
  }
};

const feedLikes = async (req, res, next) => {
  const { postId, isLiked } = req.body;
  const { id: userId } = req.user;

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
    connection.end();
    return res.status(200).send({ message: "Mission Successful.." });
  } catch (error) {
    return next(new myError(error.message, 500));
  }
};

const getLikes = async (req, res, next) => {
  const postId = req.params.postId;
  const userId = req.user.id;

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
    const [comments] = await connection.query(
      "SELECT COUNT(*) AS COUNT FROM student_feed_post_comments where pid = ?",
      [postId]
    );
    const [UR] = await connection.query(
      `SELECT id, uid, pid, created_at, is_liked FROM student_feed_post_likes WHERE pid = '${postId}' AND uid = '${userId}'`
    );

    connection.end();
    if (UR.length !== 0) {
      return res.status(200).json({
        likes: likes[0].COUNT,
        disLikes: disLikes[0].COUNT,
        userReaction: UR[0].is_liked,
        comments: comments[0].COUNT,
      });
    } else {
      return res.status(200).json({
        likes: likes[0].COUNT,
        disLikes: disLikes[0].COUNT,
        userReaction: null,
        comments: comments[0].COUNT,
      });
    }
  } catch (error) {
    return next(new myError(error.message, 500));
  }
};

const getComments = async (req, res, next) => {
  const postId = req.params.postId;

  let connection;
  try {
    connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      database: "project",
    });
    let [comments, field] = await connection.query(
      "SELECT *,s.id as commentId FROM `student_feed_post_comments` as s JOIN user as u on u.id = s.uid WHERE pid = ?",
      [postId]
    );
    connection.end();
    comments = comments.map((item) => {
      return {
        ...item,
        created_at: moment(item.created_at).format("MMMM D, YYYY"),
      };
    });
    console.log(comments);
    return res.json({ comments }).status(200);
  } catch (error) {
    console.log(error.message);
    return next(new myError(error.message, 404));
  }
};
const commentLikes = async (req, res, next) => {
  const commentId = req.params.commentId;
  const { isLiked } = req.body;
  const { id: userId } = req.user;

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
      "INSERT INTO student_feed_post_comments_likes (id,uid, cid, is_liked) VALUES (?, ?, ?,?) ON DUPLICATE KEY UPDATE is_liked = VALUES(is_liked)",
      [id, userId, commentId, isLiked]
    );
    connection.end();
    return res.status(200).send({ message: "Mission Successful.." });
  } catch (error) {
    console.log(error.message);
    return next(new myError(error.message, 400));
  }
};

const getCommentLikes = async (req, res, next) => {
  const commentId = req.params.commentId;
  const userId = req.user.id;

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
      "SELECT COUNT(*) AS COUNT FROM student_feed_post_comments_likes where cid = ? AND is_liked = 'like'",
      [commentId]
    );
    const [disLikes] = await connection.query(
      "SELECT COUNT(*) AS COUNT FROM  student_feed_post_comments_likes where cid = ? AND is_liked = 'dislike'",
      [commentId]
    );
    const [UR] = await connection.query(
      `SELECT id, uid, cid, created_at, is_liked FROM student_feed_post_comments_likes WHERE cid = '${commentId}' AND uid = '${userId}'`
    );

    connection.end();
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

const deletePost = async (req, res, next) => {
  const postId = req.params.postId;
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
    connection.query("DELETE FROM `student_feed_post` WHERE id = ?", [postId]);
    connection.end;
    res.send({ message: "Successfull" });
  } catch (error) {
    return next(myError(error.message, 400));
  }
};

const editPost = async (req, res, next) => {
  const { postId } = req.params;
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
    const [posts] = await connection.query(
      "SELECT * FROM `student_feed_post` WHERE  id = ?",
      [postId]
    );

    connection.end;
    console.log(posts);
    res.status(200).json({ post: posts[0] });
  } catch (error) {
    return next(new myError(error.message, 400));
  }
};

const updatePost = async (req, res, next) => {
  const { postId } = req.params;

  const { title, description } = req.body;

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
    // const [results];
    // if (image_url) {
    //   const [results] = await connection.query(
    //     "UPDATE student_feed_post SET content = ?, image_url =?, updated_at = CURRENT_TIMESTAMP,title =? WHERE id = ? ",
    //     [content, image_url, title, postId]
    //   );
    // } else {
    const [results] = await connection.query(
      "UPDATE student_feed_post SET content = ?, updated_at = CURRENT_TIMESTAMP,title =? WHERE id = ? ",
      [description, title, postId]
    );
    // }

    connection.end;
    console.log(results);
    res.status(200).json({ message: "Update Successfull" });
  } catch (error) {
    connection.end;
    console.log(error.message);
    return next(new myError(error.message, 400));
  }
};

const deleteComment = async (req, res, next) => {
  const commentId = req.params.commentId;
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
    connection.query("DELETE FROM `student_feed_post_comments` WHERE  id = ?", [
      commentId,
    ]);
    connection.end;
    res.send({ message: "Successfull" });
  } catch (error) {
    return next(myError(error.message, 400));
  }
};

module.exports = {
  feedPost,
  getPosts,
  feedLikes,
  getLikes,
  feedComment,
  getComments,
  commentLikes,
  getCommentLikes,
  deletePost,
  editPost,
  updatePost,
  deleteComment,
};
