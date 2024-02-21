const express = require("express");
const {
  getTopics,
  getApi,
  getArticleId,
  getArticles,
  getCommentsById,
} = require("./controller/api-controllers");
const app = express();

app.get("/api/topics", getTopics);

app.get("/api", getApi);

app.get("/api/articles", getArticles);

app.get("/api/articles/:article_id", getArticleId);

app.get("/api/articles/:article_id/comments", getCommentsById);

app.use((err, req, res, next) => {
  if (err.code === "22P02") {
    
    res.status(400).send({ msg: "Bad request" });
  } else next(err);
});

app.use((err, req, res, next) => {
  if (err.status) {
    res.status(err.status).send({ msg: err.msg });
  } else next(err);
});

app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).send({ msg: "Internal Server Error" });
});
module.exports = app;
