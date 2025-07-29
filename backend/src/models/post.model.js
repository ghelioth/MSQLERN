const db = require("../../config/db");

// module permettant de créer un nouveau post
module.exports.createPost = async (userId, message, video, picture) => {
  const [posts] = await db
    .promise()
    .query(
      "INSERT INTO posts (user_id, message, video, picture) VALUES (?, ?, ?, ?)",
      [userId, message, video || null, picture || null]
    );
  return posts;
};

module.exports.readPost = async () => {
  const [posts] = await db.promise().query("SELECT * FROM posts");
  return posts;
};

module.exports.getPostById = async (id) => {
  const [post] = await db
    .promise()
    .query("SELECT * FROM posts WHERE id = ?", [id]);
  return post;
};

module.exports.updatePost = async (id, message) => {
  const [result] = await db
    .promise()
    .query("UPDATE posts SET message = ? WHERE id = ?", [message, id]);
  return result;
};

module.exports.deletePost = async (id) => {
  const [result] = await db
    .promise()
    .query("DELETE FROM posts WHERE id = ?", [id]);
  return result;
};

module.exports.updateLikers = async (id, likerList) => {
  const sql = `UPDATE posts SET likers = ? WHERE id = ?`;
  await db.promise().query(sql, [JSON.stringify(likerList), id]);
};
