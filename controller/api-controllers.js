const {
  getAllTopics,
  selectArticle,
  getAllArticles,
  selectComments,
  insertComment,
  updateArticleVotes,
  deleteCommentById,
  getAllUsers,
} = require("../model/api-models");
const fs = require("fs/promises");
const { checkExists, validator } = require("../utils/utils");

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

exports.getCommentsById = (req, res, next) => {
  const { article_id } = req.params;
  const promises = [
    selectComments(article_id),
    checkExists("articles", "article_id", article_id),
  ];
  Promise.all(promises)
    .then((responseArray) => {
      const comments = responseArray[0];
      res.status(200).send({ comments });
    })
    .catch((err) => next(err));
};

exports.postComment = (req, res, next) => {
  const { article_id } = req.params;
  insertComment(req.body, article_id)
    .then((comment) => {
      res.status(201).send({ comment });
    })
    .catch((err) => next(err));
};

exports.patchArticles = (req, res, next) => {
  const { article_id } = req.params;

  const promises = [updateArticleVotes(req.body, article_id)];
  Promise.all(promises)
    .then((data) => {
      const article = data[0];
      if (article === undefined) {
        return Promise.reject({ status: 404, msg: "Not found" });
      }
      res.status(200).send({ article });
    })
    .catch((err) => next(err));
};

exports.deleteComments = (req, res, next) => {
  const { comment_id } = req.params;
  const promises = [
    checkExists("comments", "comment_id", comment_id),
    deleteCommentById(comment_id),
  ];
  Promise.all(promises)
    .then(() => {
      res.status(204).send();
    })

    .catch((err) => {
      next(err);
    });
};

exports.getUsers = (req, res, next) => {
  getAllUsers()
    .then((users) => {
      res.status(200).send({ users });
    })
    .catch((err) => next(err));
};
