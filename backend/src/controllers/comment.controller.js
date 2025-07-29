const commentModel = require("../models/comment.model");
// const postModel = require("../models/post.model");
const userModel = require("../models/user.model");

// controller permettant de créer un nouveau post
module.exports.createComment = async (req, res) => {
  try {
    const comment = await commentModel.createComment(
      req.body.message,
      req.body.post_id,
      req.body.user_id
    );
    res.status(201).json({
      message: "Comment created successfully",
      comment: comment,
      userId: req.body.user_id,
      postId: req.body.post_id,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// controller permettant de lire les commentaires
module.exports.readComment = async (req, res) => {
  try {
    const comments = await commentModel.readComment();
    res.status(200).json({
      message: "Comments retrieved successfully",
      comments: comments,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// controller permettant de trouver un commentaire par son ID
module.exports.getCommentById = async (req, res) => {
  try {
    const [comment] = await commentModel.getCommentById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    res.status(200).json({
      message: "Comment retrieved successfully",
      comment: comment,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// controller permettant de mettre à jour un commentaire
module.exports.updateComment = async (req, res) => {
  try {
    const comment = await commentModel.updateComment(
      req.params.id,
      req.body.message
    );
    if (comment.affectedRows === 0) {
      return res.status(404).json({ message: "Comment not found" });
    }
    res.status(200).json({
      message: "Comment updated successfully",
      postId: req.params.id,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// controller permettant de supprimer un post
module.exports.deleteComment = async (req, res) => {
  try {
    const result = await commentModel.deleteComment(req.params.id);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Comment not found" });
    }
    res.status(200).json({
      message: "Comment deleted successfully",
      postId: req.params.id,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

//  Les modules qui suivent permettent de mettre à jour les like et unlike

// Module like
module.exports.likeComment = async (req, res) => {
  try {
    const commentId = req.params.id;
    const userId = req.body.user_id;

    // On récupère le post à liker
    const [comment] = await commentModel.getCommentById(commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    let likers = comment.likers ? JSON.parse(comment.likers) : [];

    // on vérifie si l'utilisateur a déjà liké le post
    if (likers.includes(userId)) {
      return res
        .status(400)
        .json({ message: "Comment already liked by this user" });
    }

    // on ajoute l'utilisateur à la liste des likers
    likers.push(userId);

    // on met également à jour la liste des postes que l'utilisateur a liké
    const [user] = await userModel.getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let likedComments = user.commentLiked ? JSON.parse(user.commentLiked) : [];
    if (!likedComments.includes(commentId)) {
      likedComments.push(commentId);
      await userModel.updateCommentLikes(userId, likedComments);
    }

    // on met à jour le post avec la nouvelle liste de likers
    await commentModel.updateLikers(commentId, likers);

    res.status(200).json({
      message: "Comment liked successfully",
      likers: likers,
      commentId: commentId,
      likedComments: likedComments,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Module unlike
module.exports.unlikeComment = async (req, res) => {
  try {
    const commentId = req.params.id;
    const userId = req.body.user_id;

    // On récupère le post liké
    const [comment] = await commentModel.getCommentById(commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    let likers = comment.likers ? JSON.parse(comment.likers) : [];

    // on vérifie que l'utilisateur est dans la liste puis on le retire
    if (likers.includes(userId)) {
      likers = likers.filter((id) => id != userId);
      await commentModel.updateLikers(commentId, likers);
    }

    // on met également à jour la liste des postes que l'utilisateur a liké
    const [user] = await userModel.getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let likedComments = user.commentLIked ? JSON.parse(user.commentLIked) : [];

    if (likedComments.includes(commentId)) {
      likedComments = likedComments.filter((id) => id != commentId);
      await userModel.updateCommentLikes(userId, likedComments);
    }

    res.status(200).json({
      message: "Comment unliked successfully",
      likers: likers,
      commentId: commentId,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
