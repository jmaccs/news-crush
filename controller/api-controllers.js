const { getAllTopics } = require("../model/api-models");
const { app } = require("../app");
const fs = require("fs/promises");

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
