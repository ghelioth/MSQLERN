const request = require("supertest");
const fs = require("fs");
const db = require("../config/db");
const postModel = require("../src/models/post.model");
const {
  readPost,
  getPostById,
  updatePost,
  deletePost,
  likePost,
  unlikePost,
  createPost,
} = require("../src/controllers/post.controller");
const userModel = require("../src/models/user.model");

afterAll(async () => {
  await db.end();
});

// on mock les modules pour simuler leur exécution
jest.mock("../src/models/post.model");
jest.mock("../src/models/user.model");

// crud post
// test de la route qui renvoie tous les utilisateurs
describe("Test de la route /api/ : GET", () => {
  let req, res;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  test("Devrait retourner une liste de posts", async () => {
    postModel.readPost.mockResolvedValue([]);
    await readPost(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Posts retrieved successfully",
      posts: [],
    });
  });
});

describe("Test de la route /api/:id : GET", () => {
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
    jest.clearAllMocks();
  });

  test("Devrait retourner une erreur si le post n'existe pas", async () => {
    postModel.getPostById.mockResolvedValue(undefined);

    await getPostById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Post not found" });
  });

  test("Devrait retourner le post demandé ", async () => {
    postModel.getPostById.mockResolvedValue([]);

    await getPostById(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Post retrieved successfully",
      post: [],
    });
  });
});

// Route permettant de modifier un post
describe("Test de la route /api//:id : PUT", () => {
  let req, res, result;
  beforeEach(() => {
    req = {
      params: {
        id: 1,
      },
      body: {
        message: "new post",
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    result = {
      affectedRows: !0,
    };
    jest.clearAllMocks();
  });

  test("Devrait retourner un status 404", async () => {
    result.affectedRows = 0;

    postModel.updatePost.mockResolvedValue(result);

    await updatePost(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Post not found" });
  });

  test("Devrait retourner un satutus 200", async () => {
    postModel.updatePost.mockResolvedValue(result);

    await updatePost(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Post updated successfully",
      postId: req.params.id,
    });
  });
});

// Route permettant de supprimer un post
describe("Test de la route /api//:id : DELETE", () => {
  let req, res, result;
  beforeEach(() => {
    req = {
      params: {
        id: 1,
      },
      body: {
        message: "new post",
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    result = {
      affectedRows: !0,
    };
    jest.clearAllMocks();
  });

  test("Devrait retourner un status 404", async () => {
    result.affectedRows = 0;

    postModel.deletePost.mockResolvedValue(result);

    await deletePost(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Post not found" });
  });

  test("Devrait retourner un satutus 200", async () => {
    postModel.deletePost.mockResolvedValue(result);

    await deletePost(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Post deleted successfully",
      postId: req.params.id,
    });
  });
});

// route permettant de mettre à jour les likes
describe("Test de la route /like-post/:id : PATCH", () => {
  let req, res, post;
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
    post = {
      likers: "[3]",
    };
    user = {
      postLiked: "[]",
    };
    jest.clearAllMocks();
  });

  test("Devrait retourner un status 404", async () => {
    postModel.getPostById.mockResolvedValue(undefined);

    await likePost(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Post not found" });
  });

  test("Devrait retourner un status 400", async () => {
    post.likers = "[2, 4, 5]"; // bien veiller à ce que post.likers soit un format JSON car post.likers = [2, 4, 5] n'est pas un format JSON et la methode JSON.parse lévera une erreur.
    postModel.getPostById.mockResolvedValue(post);

    await likePost(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Post already liked by this user",
    });
  });

  test("Devrait retourner un status 404 avec le message d'erreur : 'User not found'", async () => {
    userModel.getUserById.mockResolvedValue(undefined);
    postModel.getPostById.mockResolvedValue(post);

    await likePost(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "User not found",
    });
  });

  test("Devrait retourner un status 200", async () => {
    userModel.getUserById.mockResolvedValue(user);
    userModel.updatePostLikes.mockResolvedValue();
    postModel.getPostById.mockResolvedValue(post);
    postModel.updateLikers.mockResolvedValue();

    await likePost(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Post liked successfully",
      postId: req.params.id,
    });
  });
});

// route permettant de mettre à jour les unlikes
describe("Test de la route /unlike-post/:id : PATCH", () => {
  let req, res, post;
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
    post = {
      likers: "[3]",
    };
    user = {
      postLiked: "[]",
    };
    jest.clearAllMocks();
  });

  test("Devrait retourner un status 404", async () => {
    postModel.getPostById.mockResolvedValue(undefined);

    await unlikePost(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Post not found" });
  });

  test("Devrait retourner un status 404 avec le message d'erreur : 'User not found'", async () => {
    userModel.getUserById.mockResolvedValue(undefined);
    postModel.getPostById.mockResolvedValue(post);
    postModel.updateLikers.mockResolvedValue();

    await unlikePost(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "User not found",
    });
  });

  test("Devrait retourner un status 200", async () => {
    userModel.getUserById.mockResolvedValue(user);
    userModel.updatePostLikes.mockResolvedValue();
    postModel.getPostById.mockResolvedValue(post);
    postModel.updateLikers.mockResolvedValue();

    await unlikePost(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Post unliked successfully",
      postId: req.params.id,
    });
  });
});

// upload d'image dans un post (Methode createPost)
describe("Test de la route /api/post/: POST", () => {
  let req, res;

  beforeEach(() => {
    req = {
      file: {
        mimetype: "image/jpg" || "image/png" || "image/jpeg",
        size: "450000",
        buffer: Buffer.from("fake image"),
      },
      body: {
        name: "test",
        user_id: "1",
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });
  // teste le type de l'image
  test("Devrait retourner l'erreur 'Format incompatible'", async () => {
    req.file.mimetype = "trtrtrt";

    await createPost(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      format: "Format incompatible",
      maxSize: "",
    });
  });

  // teste la taille de l'image
  test("Devrait retourner l'erreur 'Le fichier dépasse 500ko'", async () => {
    req.file.size = 600000;

    await createPost(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      format: "",
      maxSize: "Le fichier dépasse 500ko",
    });
  });

  // teste la bonne exécution de l'upload
  test("Devrait retourner le message suivant 'upload succes'", async () => {
    jest.spyOn(fs.promises, "writeFile").mockResolvedValue(undefined);

    await createPost(req, res);

    expect(fs.promises.writeFile).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: "Post created successfully",
    });
  });
});
