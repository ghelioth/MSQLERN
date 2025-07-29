const router = require("express").Router();
const commentController = require("../controllers/comment.controller");

router.post("/", commentController.createComment);
router.get("/", commentController.readComment);
router.get("/:id", commentController.getCommentById);
router.put("/:id", commentController.updateComment);
router.delete("/:id", commentController.deleteComment);
router.patch("/like-comment/:id", commentController.likeComment);
router.patch("/unlike-comment/:id", commentController.unlikeComment);

module.exports = router;
