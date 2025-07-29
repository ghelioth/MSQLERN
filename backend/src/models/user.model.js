const db = require("../../config/db");

// module permettant de créer un nouvel utilisateur dans la bd
module.exports.createUser = async (pseudo, email, password) => {
  const [user] = await db
    .promise()
    .query("INSERT INTO users (pseudo, email, password) VALUES (?, ?, ?)", [
      pseudo,
      email,
      password,
    ]);
  return user;
};

// module permettant de recupérer tous les utilisateurs inscrit dans la bd
module.exports.getAllUser = async () => {
  const [users] = await db
    .promise()
    .query(
      "SELECT id, pseudo, email, picture, bio, followers, following, postLiked, commentLiked, created_at, updated_at FROM users"
    );
  return users;
};

// module permettant de recupérer un utilisateur de la bd
module.exports.getUserById = async (id) => {
  const [user] = await db
    .promise()
    .query(
      "SELECT id, pseudo, email, picture, bio, followers, following, postLiked, commentLIked, created_at, updated_at FROM users WHERE id = ?",
      [id]
    );
  return user;
};

// module permettant de mettre à jour soit le nom ou la bio d'un utilisateur dans la bd
module.exports.updateUser = async (id, updates = [], values = []) => {
  values.push(id);

  const sql = `UPDATE users SET ${updates.join(`, `)} WHERE id = ?`;
  await db.promise().query(sql, values);
};

// module permettant de supprimer un utilisateur
module.exports.deleteUser = async (id) => {
  const [user] = await db
    .promise()
    .query("DELETE FROM users WHERE id = ?", [id]);
  return user;
};

// Modules permettant d'actualiser la liste des followers et following
module.exports.following = async (id, FollowingList) => {
  const sql = `UPDATE users SET following = ? WHERE id = ?`;
  await db.promise().query(sql, [JSON.stringify(FollowingList), id]);
};

module.exports.followers = async (FollowersList, id) => {
  const sql = `UPDATE users SET followers = ? WHERE id = ?`;
  await db.promise().query(sql, [JSON.stringify(FollowersList), id]);
};

// Module permettant de retrouver qui se se login dans la bd
module.exports.login = async (email) => {
  const [user] = await db
    .promise()
    .query("SELECT * FROM users WHERE email = ?", [email]);
  return user;
};

// Module permettant de mettre à jour la liste des posts likés par l'utilisateur
module.exports.updatePostLikes = async (id, likedPosts) => {
  const sql = `UPDATE users SET postLiked = ? WHERE id = ?`;
  await db.promise().query(sql, [JSON.stringify(likedPosts), id]);
};

// Module permettant de mettre à jour la liste des commentaires likés par l'utilisateur
module.exports.updateCommentLikes = async (id, likedComments) => {
  const sql = `UPDATE users SET commentLiked = ? WHERE id = ?`;
  await db.promise().query(sql, [JSON.stringify(likedComments), id]);
};

// upload
module.exports.upload = async (id, picture) => {
  const sql = `UPDATE users SET picture = ? WHERE id = ?`;
  await db.promise().query(sql, [JSON.stringify(picture), id]);
};
