const db = require("../db/connection");
const format = require("pg-format");

exports.getAllTopics = () => {
  return db
    .query("SELECT * FROM topics;")
    .then((topics) => {
      return topics.rows;
    })
    .catch((err) => {
      return err;
    });
};

exports.selectArticle = (article_id) => {
  const sql = format(`SELECT * FROM articles
  WHERE article_id = $1;
  `);
  return db.query(sql, [article_id]).then(({ rows }) => {
    const article = rows[0];
    if (!article) {
      return Promise.reject({ status: 404, msg: "Article not found" });
    }
    return article;
  });
};
