const express = require("express");
const {
  getTopics,
  getApi,
  getArticleId,
  getArticles,
  getCommentsById,
  postComment,
} = require("./controller/api-controllers");
const app = express();

app.use(express.json());

app.get("/api/topics", getTopics);

app.get("/api", getApi);

app.get("/api/articles", getArticles);

app.get("/api/articles/:article_id", getArticleId);

app.get("/api/articles/:article_id/comments", getCommentsById);

app.post("/api/articles/:article_id/comments", postComment);

app.use((err, req, res, next) => {
  if (err.status && err.msg) {
    res.status(err.status).send({ msg: err.msg });
  } else next(err);
});

app.use((err, req, res, next) => {
  if (err.code === "22P02" || err.code === "23502") {
    res.status(400).send({ msg: "Bad request" });
  } else if (err.status && err.msg) {
    res.status(err.status).send(err.msg);
  } else {
    res.status(404).send({ msg: "Not Found" });
  }
});




app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).send({ msg: "Internal Server Error" });
});
module.exports = app;
