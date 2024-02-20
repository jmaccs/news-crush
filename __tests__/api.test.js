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
        expect(output.length).toBe(3);
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

describe("GET /api/articles/:article_id", () => {
  test("should respond with an article object for the input id", () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then((res) => {
        const article = res.body.article;
        expect(typeof article).toBe("object");
        expect(article).toHaveProperty("article_id");
        expect(article).toHaveProperty("title");
        expect(article).toHaveProperty("created_at");
        expect(article).toHaveProperty("votes");
      });
  });
  test("should return a 404 on non-existing article id", () => {
    return request(app)
      .get("/api/articles/99")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Article not found");
      });
  });
  test("should return a 400 if passed invalid article id", () => {
    return request(app)
      .get("/api/articles/hello")
      .expect(400)
      .then(({ body }) => {
        console.log(body);
        expect(body.msg).toBe("Invalid input");
      });
  });
});
