const request = require("supertest");
const server = require("../src/server");
const db = require("../config/db");

// authentification

// on mock le module pour éviter de vraiment créer un utilisateur
jest.mock("../src/models/user.model", () => ({
  createUser: jest.fn(),
}));

const { createUser } = require("../src/models/user.model");

describe("POST /api/user/register", () => {
  it("Devrait retourner 400 si body vide", async () => {
    const res = await request(server).post("/api/user/register").send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Champs requis");
  });

  it("Devrait simuler la création d'un utilisateur sans DB", async () => {
    createUser.mockResolvedValue({
      id: 1,
      pseudo: "test",
      email: "test@example.com",
      password: "test@1234",
    });
    const res = await request(server)
      .post("/api/user/register")
      .type("form")
      .send({
        pseudo: "test",
        email: "test@example.com",
        password: "test@1234",
      });
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      id: 1,
      pseudo: "test",
      email: "test@example.com",
      password: "test@1234",
    });
  });
});

// crud user
// test de la route qui renvoie tous les utilisateurs
describe("Test de la route /api/user : GET", () => {
  it("Devrait retourner une liste d'utilisateurs", async () => {
    const res = await request(server).get("/api/user");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.users)).toBe(true);
  });
});

// test de la route qui renvoie un utilisateur
describe("Test de la route /api/user/:id : GET", () => {
  it("Devrait retourner un utilisateur", async () => {
    const res = await request(server).get("/api/user/1");
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Voici l'utilisateur demandé");
  });
});

// test de la route permettant de modifier soit la bio ou le pseudo d'un utilisateur sans req.body
describe("Test de la route /api/user/:id : PUT", () => {
  it("Ne devrait rien modifier", async () => {
    const res = await request(server).put("/api/user/1").type("form").send({});
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Impossible de modifier ce champ");
  });
});

// test de la route permettant de modifier soit la bio ou le pseudo d'un utilisateur sans req.body
describe("Test de la route /api/user/:id : PUT", () => {
  it("Devrait modifier le pseudo", async () => {
    const res = await request(server)
      .put("/api/user/1")
      .type("form")
      .send({ pseudo: "pseudo" });
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("updated");
  });
});

// test de la route permettant de modifier soit la bio ou le pseudo d'un utilisateur sans req.body
describe("Test de la route /api/user/:id : PUT", () => {
  it("Devrait modifier la bio", async () => {
    const res = await request(server)
      .put("/api/user/1")
      .type("form")
      .send({ bio: "patati patata" });
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("updated");
  });
});

// test de la route permettant de modifier la bio et le pseudo d'un utilisateur sans req.body
describe("Test de la route /api/user/:id : PUT", () => {
  it("Devrait modifier le pseudo + bio", async () => {
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
  it("Devrait supprimer un utilisateur", async () => {
    const res = await request(server).delete("/api/user/1");
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Deleted");
    expect(res.body.user).toBe("1");
  });
});

// test de la route permettant de follow un utilisateur
describe("Test de la route /api/user/follow/:id : PATCH", () => {
  it("Follow un utilisateur", async () => {
    const res = await request(server).patch("/api/user/follow/2").send({
      idToFollow: "1",
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("follow");
  });
});

// test de la route permettant de follow un utilisateur
describe("Test de la route /api/user/follow/:id : PATCH", () => {
  it("Follow un utilisateur", async () => {
    const res = await request(server).patch("/api/user/unfollow/2").send({
      idToFollow: "1",
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("unfollow");
  });
});

// upload d'image (photo de profil)
