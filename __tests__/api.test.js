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
        expect(article["article_id"]).toBe(1);
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
        expect(body.msg).toBe("Not found");
      });
  });
  test("should return a 400 if passed invalid article id", () => {
    return request(app)
      .get("/api/articles/hello")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request");
      });
  });
});

describe("GET /api/articles", () => {
  test("should return an array of article objects featuring article_id and comment_count properties", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then((data) => {
        const articles = data.body.articles;
        expect(typeof articles).toBe("object");
        articles.forEach((article) => {
          expect(article).toHaveProperty("title", expect.any(String));
          expect(article).toHaveProperty("topic", expect.any(String));
          expect(article).toHaveProperty("author", expect.any(String));
          expect(article).not.toHaveProperty("body");
          expect(article).toHaveProperty("created_at", expect.any(String));
          expect(article).toHaveProperty("article_img_url", expect.any(String));
          expect(article).toHaveProperty("votes", expect.any(Number));
          expect(article).toHaveProperty("comment_count", expect.any(String));
        });
      });
  });
  test("should be ordered by date descending", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then((data) => {
        const articles = data.body.articles;
        expect(articles).toBeSortedBy("created_at", { descending: true });
      });
  });
  test("should return accurate comment_count property", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then((data) => {
        const articles = data.body.articles;
        const article = articles[6];
        expect(article["comment_count"]).toBe("11");
      });
  });
});

describe("GET /api/articles/:article_id/comments", () => {
  test("should respond with an array of comments objects corresponding to the article id", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then((data) => {
        const comments = data.body.comments;
        expect(typeof comments).toBe("object");
        comments.forEach((comment) => {
          expect(comment["article_id"]).toBe(1);
          expect(comment).toHaveProperty("comment_id", expect.any(Number));
          expect(comment).toHaveProperty("votes", expect.any(Number));
          expect(comment).toHaveProperty("created_at", expect.any(String));
          expect(comment).toHaveProperty("author", expect.any(String));
          expect(comment).toHaveProperty("body", expect.any(String));
        });
      });
  });
  test("should be ordered by most recent first", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then((data) => {
        const comments = data.body.comments;
        expect(comments).toBeSortedBy("created_at", { descending: true });
      });
  });
  test("should return an empty array if article has no comments", () => {
    return request(app)
      .get("/api/articles/2/comments")
      .expect(200)
      .then((data) => {
        const comments = data.body.comments;
        expect(comments).toEqual([]);
      });
  });
  test("should return a 404 if article does not exist", () => {
    return request(app)
      .get("/api/articles/99/comments")
      .expect(404)
      .then((data) => {
        const actual = data.body.msg;
        expect(actual).toBe("Not found");
      });
  });
});
describe("POST /api/articles/:article_id/comments", () => {
  test("should respond with 201 and the posted comment", () => {
    const testComment = {
      username: "lurker",
      body: "i have been stuck in vim for 300 days. this is my life now.",
    };
    return request(app)
      .post("/api/articles/3/comments")
      .send(testComment)
      .expect(201)
      .then(({ body }) => {
        const { comment } = body;
        expect(comment).toHaveProperty("author", "lurker");
        expect(comment).toHaveProperty("votes", expect.any(Number));
        expect(comment).toHaveProperty("created_at", expect.any(String));
        expect(comment).toHaveProperty(
          "body",
          "i have been stuck in vim for 300 days. this is my life now."
        );
      });
  });
  test("should respond with a 404 when passed an unregistered username", () => {
    const testComment = {
      username: "ghostpizza420",
      body: "one does not simply exit vim",
    };
    return request(app)
      .post("/api/articles/3/comments")
      .send(testComment)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Not found");
      });
  });
  test("should respond with a 400 if passed a comment with no body", () => {
    const testComment = {
      username: "lurker",
    };
    return request(app)
      .post("/api/articles/3/comments")
      .send(testComment)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request");
      });
  });
  test("should return a 404 if passed non-existent article id", () => {
    const testComment2 = {
      username: "lurker",
      body: "help",
    };
    return request(app)
      .post("/api/articles/99/comments")
      .send(testComment2)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Not found");
      });
  });
  test("should respond with a 400 if passed invalid article id", () => {
    const testComment = {
      username: "lurker",
      body: "hello?",
    };
    return request(app)
      .post("/api/articles/string/comments")
      .send(testComment)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request");
      });
  });
  test("should respond with a 400 if passed additional keys", () => {
    const testComment = {
      username: "lurker",
      body: "...",
      article_id: 4,
    };
    return request(app)
      .post("/api/articles/string/comments")
      .send(testComment)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request");
      });
  });
});

describe("PATCH /api/articles/:article_id", () => {
  test("should increment article votes by a given number", () => {
    const patch = { inc_votes: 5 };
    return request(app)
      .patch("/api/articles/1")
      .send(patch)
      .expect(200)
      .then(({ body }) => {
        const { article } = body;
        console.log(article);
        expect(article).toHaveProperty("article_id", 1);
        expect(article).toHaveProperty("votes", 105);
      });
  });
  test("should decrement article votes by a given number", () => {
    const patch = { inc_votes: -5 };
    return request(app)
      .patch("/api/articles/1")
      .send(patch)
      .expect(200)
      .then(({ body }) => {
        const { article } = body;
        expect(article).toHaveProperty("article_id", 1);
        expect(article).toHaveProperty("votes", 95);
      });
  });
  test("should return a 400 if passed invalid article id", () => {
    const patch = { inc_votes: 5 };
    return request(app)
      .patch("/api/articles/string")
      .send(patch)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request");
      });
  });
  test("should return a 404 if passed non-existent article id", () => {
    const patch = { inc_votes: 5 };
    return request(app)
      .patch("/api/articles/99")
      .send(patch)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Not found");
      });
  });
});
describe("DELETE /api/comments/:comment_id", () => {
  test("should delete the comment corresponding to given comment_id and return 204", () => {
    return request(app).delete("/api/comments/1").expect(204);
  });
  test("should return a 404 on a non existent comment", () => {
    return request(app)
      .delete("/api/comments/99")
      .expect(404)
      .then(({ body }) => {
        console.log(body);
        expect(body.msg).toBe("Not found");
      });
  });
  test("should return a 400 on an invalid id", () => {
    return request(app)
      .delete("/api/comments/string")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request");
      });
  });
});
describe.only("GET /api/users", () => {
  test("should return an array of user objects", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then((data) => {
        const output = data.body.users;
        expect(output.length).toBe(4);
        expect(typeof output).toBe("object");
        output.forEach((user) => {
          expect(user).toHaveProperty("username");
          expect(user).toHaveProperty("name");
          expect(user).toHaveProperty("avatar_url");
        });
      });
  });
});
