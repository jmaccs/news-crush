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

exports.getAllArticles = () => {
  let sql = `
  SELECT
  articles.author,
  articles.title,
  articles.article_id,
  articles.topic,
  articles.created_at,
  articles.votes,
  articles.article_img_url,
  COUNT(comments.article_id) AS comment_count
FROM
  articles 
LEFT JOIN
  comments ON articles.article_id = comments.article_id
GROUP BY
  articles.article_id
ORDER BY
  articles.created_at DESC;`;
  return db.query(sql).then((data) => {

    return data.rows;
  });
};
