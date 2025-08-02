const request = require("supertest");
const server = require("../src/server");
const db = require("../config/db");

afterAll(async () => {
  await db.end();
});
