const db = require("../db/connection");

exports.getAllTopics = () => {
  return db
    .query("SELECT * FROM topics;")
    .then((topics) => {
      console.log(topics.rows, "<---- inside model");
      return topics.rows;
    })
    .catch((err) => {
      return err;
    });
};
