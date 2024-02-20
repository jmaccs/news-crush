const {
  getAllTopics,
  selectArticle,
  getAllArticles,
} = require("../model/api-models");
const { app } = require("../app");
const fs = require("fs/promises");
const { log } = require("console");

exports.getTopics = (req, res, next) => {
  getAllTopics()
    .then((topics) => {
      res.status(200).send({ topics });
    })
    .catch((err) => next(err));
};

exports.getApi = (req, res, next) => {
  return fs
    .readFile("endpoints.json", "utf-8")
    .then((apis) => {
      res.status(200).send(JSON.parse(apis));
    })
    .catch((err) => next(err));
};

exports.getArticleId = (req, res, next) => {
  const { article_id } = req.params;
  selectArticle(article_id)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getArticles = (req, res, next) => {
  getAllArticles()
    .then((articles) => {
      res.status(200).send({ articles });
    })
    .catch((err) => next(err));
};
