const { getAllTopics } = require("../model/api-models");
const { app } = require("../app");

exports.getTopics = (req, res, next) => {
  getAllTopics()
    .then((topics) => {
      console.log(topics, "<----- controller");
      res.status(200).send({ topics });
    })
    .catch((err) => next(err));
};
