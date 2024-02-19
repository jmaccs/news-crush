const app = require("../app");
const request = require("supertest");
const data = require("../db/data/test-data/index");
const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const endpoints = require("../endpoints.json");
require("jest-sorted");

beforeEach(() => seed(data));
afterAll(() => db.end());

describe("GET /api/topics", () => {
  test("should respond with a 200 status and an array containing all topics objs", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then((data) => {
        const output = data.body.topics;
        expect(typeof output).toBe("object");
        output.forEach((topic) => {
          expect(topic).toHaveProperty("slug");
          expect(topic).toHaveProperty("description");
        });
      });
  });
});

describe("GET /api", () => {
  test("should respond with an object listing all endpoints as nested objects", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then((api) => {
        const output = api.body;
        expect(endpoints).toMatchObject(output);
      });
  });
});
