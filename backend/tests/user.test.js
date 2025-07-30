const request = require("supertest");
const server = require("../src/server");
const db = require("../config/db");

afterAll(async () => {
  await db.end();
});
// authentification
// on mock le module pour éviter de vraiment créer un utilisateur
jest.mock("../src/models/user.model");

describe("POST /api/user/register", () => {
  test("Devrait retourner 400 si body vide", async () => {
    const res = await request(server).post("/api/user/register");
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Champs requis");
  });

  test("Devrait simuler la création d'un utilisateur sans DB", async () => {
    const res = await request(server).post("/api/user/register").send({
      pseudo: "tests",
      email: "test@example.com",
      password: "test@1234",
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.errors.autre).toEqual("Quelque chose s'est mal passé");
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

// test de la route permettant de follow un utilisateur
describe("Test de la route /api/user/follow/:id : PATCH", () => {
  test("Follow un utilisateur", async () => {
    const res = await request(server).patch("/api/user/unfollow/2").send({
      idToFollow: "1",
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("unfollow");
  });
});

// upload d'image (photo de profil)
