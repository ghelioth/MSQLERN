const fs = require("fs");
const postModel = require("../models/post.model");
const userModel = require("../models/user.model");
const { uploadErrors } = require("../utilities/error.utility");

// controller permettant de créer un nouveau post
module.exports.createPost = async (req, res) => {
  let fileName;
  if (req.file !== undefined) {
    try {
      const allowedMimeTypes = ["image/jpg", "image/png", "image/jpeg"];

      if (!allowedMimeTypes.includes(req.file.mimetype)) {
        throw new Error("Invalid file");
      }

      if (req.file.size > 500000) {
        throw Error("Max size");
      }
    } catch (err) {
      const errors = uploadErrors(err);
      return res.status(400).json(errors);
    }

    //   on recupère l'image passé dans le body et on l'enregistre dans le dossier profil
    fileName = req.body.user_id + Date.now() + ".jpg";
    const filePath = `${__dirname}/../client/public/uploads/posts/${fileName}`;
    await fs.promises.writeFile(filePath, req.file.buffer);
  }

  // on sauvegarde dans la bd
  try {
    const post = await postModel.createPost(
      req.body.user_id,
      req.body.message,
      req.body.video,
      req.file !== undefined ? "./uploads/posts/" + fileName : ""
    );
    res.status(201).json({
      message: "Post created successfully",
      post: post,
      user_id: req.body.id,
      // postId: post.insertId,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// controller permettant de lire les posts
module.exports.readPost = async (req, res) => {
  try {
    const posts = await postModel.readPost();
    res.status(200).json({
      message: "Posts retrieved successfully",
      posts: posts,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// controller permettant de lire un post par son ID
module.exports.getPostById = async (req, res) => {
  try {
    const post = await postModel.getPostById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.status(200).json({
      message: "Post retrieved successfully",
      post: post,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// controller permettant de mettre à jour un post
module.exports.updatePost = async (req, res) => {
  try {
    const result = await postModel.updatePost(req.params.id, req.body.message);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.status(200).json({
      message: "Post updated successfully",
      postId: req.params.id,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// controller permettant de supprimer un post
module.exports.deletePost = async (req, res) => {
  try {
    const result = await postModel.deletePost(req.params.id);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.status(200).json({
      message: "Post deleted successfully",
      postId: req.params.id,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

//  Les modules qui suivent permettent de mettre à jour les like et unlike

// Module like
module.exports.likePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.body.user_id;

    // On récupère le post à liker
    const post = await postModel.getPostById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    let likers = post.likers ? JSON.parse(post.likers) : [];

    // on vérifie si l'utilisateur a déjà liké le post
    if (likers.includes(userId)) {
      return res
        .status(400)
        .json({ message: "Post already liked by this user" });
    }

    // on ajoute l'utilisateur à la liste des likers
    likers.push(userId);

    // on met également à jour la liste des postes que l'utilisateur a liké
    const user = await userModel.getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let likedPosts = user.postLiked ? JSON.parse(user.postLiked) : [];
    if (!likedPosts.includes(postId)) {
      likedPosts.push(postId);
      await userModel.updatePostLikes(userId, likedPosts);
    }

    // on met à jour le post avec la nouvelle liste de likers
    await postModel.updateLikers(postId, likers);

    res.status(200).json({
      message: "Post liked successfully",
      // likers: likers,
      postId: postId,
      // likedPosts: likedPosts,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Module unlike
module.exports.unlikePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.body.user_id;

    // On récupère le post liké
    const post = await postModel.getPostById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    let likers = post.likers ? JSON.parse(post.likers) : [];

    // on vérifie que l'utilisateur est dans la liste puis on le retire
    if (likers.includes(userId)) {
      likers = likers.filter((id) => id != userId);
      await postModel.updateLikers(postId, likers);
    }

    // on met également à jour la liste des postes que l'utilisateur a liké
    const user = await userModel.getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let likedPosts = user.postLiked ? JSON.parse(user.postLiked) : [];

    if (likedPosts.includes(postId)) {
      likedPosts = likedPosts.filter((id) => id != postId);
      await userModel.updatePostLikes(userId, likedPosts);
    }

    res.status(200).json({
      message: "Post unliked successfully",
      // likers: likers,
      postId: postId,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
