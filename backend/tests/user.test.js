const bcrypt = require("bcrypt");
const {
  signUp,
  signIn,
  logout,
} = require("../src/controllers/auth.controller");
const userModel = require("../src/models/user.model");
const request = require("supertest");
const server = require("../src/server");
const db = require("../config/db");
const { trim, isEmail, crypt } = require("../src/utilities/user.utility");
const fs = require("fs");
const { uploadProfil } = require("../src/controllers/upload.controller");

afterAll(async () => {
  await db.end();
});

// on mock les modules pour simuler leur exécution
// Ceci m'évite par exemple de vraiment un user quand je teste la route register
jest.mock("../src/models/user.model");
jest.mock("bcrypt");
jest.mock("../src/utilities/user.utility");

// authentification
// test de la route qui permet à un utilisateur de s'enrégistrer
describe("POST /api/user/register", () => {
  let req, res;
  beforeEach(() => {
    req = {
      body: {
        pseudo: "test",
        email: "test@testexample.com",
        password: "test@test1234",
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
    };
    jest.clearAllMocks();
  });
  test("Devrait retourner 400 si req.body est vide", async () => {
    req.body = undefined;
    await signUp(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Champs requis" });
  });

  test("Devrait retourner une erreur si pseudo trop court", async () => {
    trim.mockResolvedValue({ error: "pseudo trop court" });

    await signUp(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "pseudo trop court" });
  });

  test("Devrait retourner une erreur si email invalide", async () => {
    trim.mockResolvedValue("Test");
    isEmail.mockResolvedValue({ error: "Email invalide" });

    await signUp(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Email invalide" });
  });

  test("Devrait retourner une erreur si mdp invalide", async () => {
    trim.mockResolvedValue("Test");
    isEmail.mockResolvedValue("test@example.com");
    crypt.mockResolvedValue({ error: "Mot de passe trop court" });

    await signUp(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Mot de passe trop court",
    });
  });

  test("Devrait retourner une erreur si le pseudo existe déjà", async () => {
    trim.mockResolvedValue("tests");
    isEmail.mockResolvedValue("test@example.com");
    crypt.mockResolvedValue("hashedPassword");
    userModel.createUser.mockResolvedValue({
      error: "Duplicate entry 'tests' for key 'users.pseudo'",
    });

    await signUp(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      email: "",
      pseudo: "Pseudo incorrect ou déjà pris",
    });
  });

  test("Devrait retourner une erreur si le mail existe déjà", async () => {
    trim.mockResolvedValue("tests");
    isEmail.mockResolvedValue("test@example.com");
    crypt.mockResolvedValue("hashedPassword");
    userModel.createUser.mockResolvedValue({
      error: "Duplicate entry 'test@example.com' for key 'users.email'",
    });

    await signUp(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      email: "Email déjà enrégistré",
      pseudo: "",
    });
  });

  test("Devrait enregistrer un utilisateur avec succès", async () => {
    trim.mockResolvedValue("Test");
    isEmail.mockResolvedValue("test@example.com");
    crypt.mockResolvedValue("hashedPassword");
    userModel.createUser.mockResolvedValue({
      id: 1,
      pseudo: "Test",
      email: "test@example.com",
    });

    await signUp(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: "créé" });
  });
});

// test de la route qui permet à un utilisateur de se connecter
describe("POST /api/user/login", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: { email: "test@testexample.com", password: "test@test1234" },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      cookie: jest.fn(),
    };
  });

  test("Devrait retourner une erreur si l'utilisateur n'existe pas", async () => {
    userModel.login.mockResolvedValue([null]);
    await signIn(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ error: "Email inconnu" });
  });

  test("Devrait retourner une erreur si le mot de passe est invalide", async () => {
    userModel.login.mockResolvedValue([{ id: 1, password: "HashedPassword" }]);
    bcrypt.compare.mockResolvedValue(false);

    await signIn(req, res);

    expect(res.json).toHaveBeenCalledWith({ error: "Mot de passe incorrect" });
  });

  test("Devrait retourner un cookie si tout est correct", async () => {
    userModel.login.mockResolvedValue([{ id: 1, password: "HashedPassword" }]);
    bcrypt.compare.mockResolvedValue(true);

    await signIn(req, res);

    expect(res.cookie).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ user: 1 });
  });
});

// test de la route logout permettant de deconnecter un utilisateur
describe("GET /api/user/logout", () => {
  let req, res;

  beforeEach(() => {
    req = {};
    res = {
      redirect: jest.fn(),
      cookie: jest.fn(),
    };
  });
  test("Devrait deconnecter un utilisateur en supprimant le cookie", async () => {
    await logout(req, res);

    expect(res.cookie).toHaveBeenCalledWith("jwt", "", { maxAge: 1 });
    expect(res.redirect).toHaveBeenCalledWith("/");
  });
});

// crud user
// test de la route qui renvoie tous les utilisateurs
describe("Test de la route /api/user : GET", () => {
  test("Devrait retourner une liste d'utilisateurs", async () => {
    const res = await request(server).get("/api/user");
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Voici la liste de tous les utilisateurs");
  });
});

// test de la route qui renvoie un utilisateur
describe("Test de la route /api/user/:id : GET", () => {
  test("Devrait retourner un utilisateur", async () => {
    const res = await request(server).get("/api/user/1");
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Voici l'utilisateur demandé");
  });
});

// test de la route permettant de modifier soit la bio ou le pseudo d'un utilisateur
describe("Test de la route /api/user/:id : PUT", () => {
  // test de la route permettant de modifier soit la bio ou le pseudo d'un utilisateur sans req.body
  test("Ne devrait rien modifier", async () => {
    const res = await request(server).put("/api/user/1").type("form").send({});
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Impossible de modifier ce champ");
  });

  // test de la route permettant de modifier le pseudo d'un utilisateur avec req.body.pseudo
  test("Devrait modifier le pseudo", async () => {
    const res = await request(server)
      .put("/api/user/1")
      .type("form")
      .send({ pseudo: "pseudo" });
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("updated");
  });

  // test de la route permettant de modifier soit la bio d'un utilisateur avec req.body.bio
  test("Devrait modifier la bio", async () => {
    const res = await request(server)
      .put("/api/user/1")
      .type("form")
      .send({ bio: "patati patata" });
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("updated");
  });

  // test de la route permettant de modifier la bio et le pseudo d'un utilisateur sans req.body
  test("Devrait modifier le pseudo + bio", async () => {
    const res = await request(server)
      .put("/api/user/1")
      .type("form")
      .send({ pseudo: "helioth", bio: "patati patata" });
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("updated");
  });
});

// test de la route permettant de supprimer un utilisateur
describe("Test de la route /api/user/:id : DELETE", () => {
  test("Devrait supprimer un utilisateur", async () => {
    const res = await request(server).delete("/api/user/1");
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Deleted");
    expect(res.body.user).toBe("1");
  });
});

// test de la route permettant de follow un utilisateur
describe("Test de la route /api/user/follow/:id : PATCH", () => {
  test("Follow un utilisateur", async () => {
    const res = await request(server).patch("/api/user/follow/2").send({
      idToFollow: "1",
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("follow");
  });
});

// test de la route permettant de unfollow un utilisateur
describe("Test de la route /api/user/follow/:id : PATCH", () => {
  test("Unfollow un utilisateur", async () => {
    const res = await request(server).patch("/api/user/unfollow/2").send({
      idToFollow: "1",
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("unfollow");
  });
});

// upload d'image (photo de profil)
describe("Test de la route /api/user/upload : POST", () => {
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
      send: jest.fn(),
    };
    jest.clearAllMocks();
  });
  // teste le type de l'image
  test("Devrait retourner l'erreur 'Format incompatible'", async () => {
    req.file.mimetype = "trtrtrt";

    await uploadProfil(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      format: "Format incompatible",
      maxSize: "",
    });
  });

  // teste la taille de l'image
  test("Devrait retourner l'erreur 'Le fichier dépasse 500ko'", async () => {
    req.file.size = 600000;

    await uploadProfil(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      format: "",
      maxSize: "Le fichier dépasse 500ko",
    });
  });

  // teste la bonne exécution de l'upload
  test("Devrait retourner le message suivant 'upload succes'", async () => {
    jest.spyOn(fs.promises, "writeFile").mockResolvedValue(undefined); // Comprendre prochainement ce que fait jest.spyOn
    // J'ai bien compris que cette methode permet de ne pas écraser tout le module "fs" mal structuré

    await uploadProfil(req, res);

    expect(fs.promises.writeFile).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: "upload succes" });
  });
});
