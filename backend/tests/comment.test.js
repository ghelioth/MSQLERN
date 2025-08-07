const db = require("../config/db");
const {
  createComment,
  readComment,
  getCommentById,
  updateComment,
  deleteComment,
  likeComment,
  unlikeComment,
} = require("../src/controllers/comment.controller");
const commentModel = require("../src/models/comment.model");
const userModel = require("../src/models/user.model");

afterAll(async () => {
  await db.end();
});
// on mock les modules
jest.mock("../src/models/comment.model");
jest.mock("../src/models/user.model");
// Crud comment
// createComment Post
describe("Test la route 'api/comment/' : POST ", () => {
  let req, res;
  beforeEach(() => {
    req = {
      body: {
        message: "un commentaire",
        post_id: 1,
        user_id: 1,
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  test("Devrait retourner un status 500 si le req.body n'exixte pas", async () => {
    req.body = undefined;

    await createComment(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Cannot read properties of undefined (reading 'message')",
    });
  });

  test("Devrait retourner un status 201 avec le message 'Comment created successfully' ", async () => {
    await createComment(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: "Comment created successfully",
      userId: req.body.user_id,
      postId: req.body.post_id,
    });
  });
});

// ReadComment GET
describe("Test la route 'api/comment/' : GET", () => {
  let req, res;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  test("Devrait retourner un status 404 si pas de commentaires", async () => {
    commentModel.readComment.mockResolvedValue([]);

    await readComment(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "No comments",
    });
  });

  test("Devrait retourner un status 200 avec les commentaires", async () => {
    commentModel.readComment.mockResolvedValue(["Un commentaire"]);

    await readComment(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Comments retrieved successfully",
      comments: "Un commentaire",
    });
  });

  test("Devrait retourner une erreur avec un satus 500 si tout ne se passe pas bien", async () => {
    commentModel.readComment.mockResolvedValue({
      error: "impossible de lire les commentaires",
    });

    await readComment(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// getCommentById GET
describe("Test la route 'api/comment/:id' : GET", () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: {
        id: 1,
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  test("Devrait retourner un status 404 si pas de commentaires", async () => {
    commentModel.getCommentById.mockResolvedValue([]);

    await getCommentById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "Comment not found",
    });
  });

  test("Devrait retourner un status 200 avec les commentaires", async () => {
    commentModel.getCommentById.mockResolvedValue(["Un commentaire"]);

    await getCommentById(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Comment retrieved successfully",
      comment: "Un commentaire",
    });
  });

  test("Devrait retourner une erreur avec un satus 500 si tout ne se passe pas bien", async () => {
    commentModel.getCommentById.mockResolvedValue({
      error: "impossible de lire le commentaire",
    });

    await getCommentById(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// updateComment
describe("Test la route 'api/comment/:id' : PUT", () => {
  let req, res, comment;
  beforeEach(() => {
    req = {
      body: {
        message: "un commentaire",
      },
      params: {
        id: 1,
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    comment = {
      affectedRows: !0,
    };
  });

  test("Devrait retourner un status 404", async () => {
    comment.affectedRows = 0;
    commentModel.updateComment.mockResolvedValue(comment);

    await updateComment(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Comment not found" });
  });

  test("Devrait retourner un status 200", async () => {
    commentModel.updateComment.mockResolvedValue(comment);

    await updateComment(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Comment updated successfully",
      postId: req.params.id,
    });
  });

  test("Devrait retourner une erreur avec un satus 500 si tout ne se passe pas bien", async () => {
    commentModel.updateComment.mockResolvedValue({
      error: "impossible de lire le commentaire",
    });

    await updateComment(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Something went wrong !",
    });
  });
});

// deleteComment
describe("Test la route 'api/comment/:id' : DELETE", () => {
  let req, res, result;
  beforeEach(() => {
    req = {
      params: {
        id: 1,
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    result = {
      affectedRows: !0,
    };
  });

  test("Devrait retourner un status 404", async () => {
    result.affectedRows = 0;
    commentModel.deleteComment.mockResolvedValue(result);

    await deleteComment(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Comment not found" });
  });

  test("Devrait retourner un status 200", async () => {
    commentModel.deleteComment.mockResolvedValue(result);

    await deleteComment(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Comment deleted successfully",
      postId: req.params.id,
    });
  });

  test("Devrait retourner une erreur avec un satus 500 si tout ne se passe pas bien", async () => {
    commentModel.deleteComment.mockResolvedValue({
      error: "impossible de lire le commentaire",
    });

    await deleteComment(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Something went wrong !",
    });
  });
});

// router.patch("/like-comment/:id", commentController.likeComment);
describe("Test de la route /like-comment/:id : PATCH", () => {
  let req, res, comment;
  beforeEach(() => {
    req = {
      params: {
        id: 1,
      },
      body: {
        user_id: 2,
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    comment = {
      likers: "[3]",
    };
    user = {
      commentLiked: "[]",
    };
    jest.clearAllMocks();
  });

  test("Devrait retourner un status 404", async () => {
    commentModel.getCommentById.mockResolvedValue(undefined);

    await likeComment(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Comment not found" });
  });

  test("Devrait retourner un status 400", async () => {
    comment.likers = "[2, 4, 5]"; // bien veiller à ce que comment.likers soit un format JSON car comment.likers = [2, 4, 5] n'est pas un format JSON et la methode JSON.parse lévera une erreur.
    commentModel.getCommentById.mockResolvedValue(comment);

    await likeComment(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Comment already liked by this user",
    });
  });

  test("Devrait retourner un status 404 avec le message d'erreur : 'User not found'", async () => {
    userModel.getUserById.mockResolvedValue(undefined);
    commentModel.getCommentById.mockResolvedValue(comment);

    await likeComment(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "User not found",
    });
  });

  test("Devrait retourner un status 200", async () => {
    userModel.getUserById.mockResolvedValue(user);
    userModel.updateCommentLikes.mockResolvedValue();
    commentModel.getCommentById.mockResolvedValue(comment);
    commentModel.updateLikers.mockResolvedValue();

    await likeComment(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Comment liked successfully",
      commentId: req.params.id,
    });
  });
});

// router.patch("/unlike-comment/:id", commentController.unlikeComment);
describe("Test de la route /unlike-comment/:id : PATCH", () => {
  let req, res, comment;
  beforeEach(() => {
    req = {
      params: {
        id: 1,
      },
      body: {
        user_id: 2,
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    comment = {
      likers: "[3]",
    };
    user = {
      commentLiked: "[]",
    };
    jest.clearAllMocks();
  });

  test("Devrait retourner un status 404", async () => {
    commentModel.getCommentById.mockResolvedValue(undefined);

    await unlikeComment(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Comment not found" });
  });

  test("Devrait retourner un status 404 avec le message d'erreur : 'User not found'", async () => {
    userModel.getUserById.mockResolvedValue(undefined);
    commentModel.getCommentById.mockResolvedValue(comment);
    commentModel.updateLikers.mockResolvedValue();

    await unlikeComment(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "User not found",
    });
  });

  test("Devrait retourner un status 200", async () => {
    userModel.getUserById.mockResolvedValue(user);
    userModel.updateCommentLikes.mockResolvedValue();
    commentModel.getCommentById.mockResolvedValue(comment);
    commentModel.updateLikers.mockResolvedValue();

    await unlikeComment(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Comment unliked successfully",
      commentId: req.params.id,
    });
  });
});
