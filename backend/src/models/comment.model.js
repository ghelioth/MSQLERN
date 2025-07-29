const db = require("../../config/db");

// module permettant de créer un nouveau commentaire
module.exports.createComment = async (message, postId, userId) => {
  const [comments] = await db
    .promise()
    .query(
      "INSERT INTO comments (message, post_id, user_id) VALUES (?, ?, ?)",
      [message, postId, userId]
    );
  return comments;
};

module.exports.readComment = async () => {
  const [comments] = await db.promise().query("SELECT * FROM comments");
  return comments;
};

module.exports.getCommentById = async (id) => {
  const [comment] = await db
    .promise()
    .query("SELECT * FROM comments WHERE id = ?", [id]);
  return comment;
};

module.exports.updateComment = async (id, message) => {
  const [comment] = await db
    .promise()
    .query("UPDATE comments SET message = ? WHERE id = ?", [message, id]);
  return comment;
};

module.exports.deleteComment = async (id) => {
  const [comment] = await db
    .promise()
    .query("DELETE FROM comments WHERE id = ?", [id]);
  return comment;
};

module.exports.updateLikers = async (id, likerList) => {
  const sql = `UPDATE comments SET likers = ? WHERE id = ?`;
  await db.promise().query(sql, [JSON.stringify(likerList), id]);
};
