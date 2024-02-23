const db = require("../db/connection");
const format = require("pg-format");
const { checkExists, validator } = require("../utils/utils");

exports.getAllTopics = () => {
  return db.query("SELECT * FROM topics;").then((topics) => {
    return topics.rows;
  });
};

exports.selectArticle = (article_id) => {
  const sql = format(`SELECT * FROM articles
  WHERE article_id = $1;
  `);
  return db.query(sql, [article_id]).then(({ rows }) => {
    const article = rows[0];
    if (!article) {
      return Promise.reject({ status: 404, msg: "Not found" });
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
exports.selectComments = (article_id) => {
  let sql = format(`
  SELECT
  comment_id,
  votes,
  created_at,
  author,
  body,
  article_id
  FROM 
    comments
  WHERE
  article_id = $1
  ORDER BY
  created_at DESC;
    `);
  return db.query(sql, [article_id]).then(({ rows }) => {
    return rows;
  });
};

exports.insertComment = (comment, article_id) => {
  const { username, body } = comment;
  return db
    .query(
      `INSERT INTO comments (author, body, article_id) VALUES ($1, $2, $3) RETURNING *;`,
      [username, body, article_id]
    )
    .then(({ rows }) => {
 
      return rows[0];
    });
};

exports.updateArticleVotes = (votes, article_id) => {
  const { inc_votes } = votes;
  return db
    .query(
      `UPDATE articles SET votes = votes + $1 WHERE article_id = $2 RETURNING *;`,
      [inc_votes, article_id]
    )
    .then(({ rows }) => {
      console.log(rows[0],'model');
      return rows[0]; 
    });
};

exports.deleteCommentById = (comment_id) => {
  let sql = "DELETE FROM comments WHERE comment_id = $1 RETURNING *;";

  return db.query(sql, [comment_id]).then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({ status: 404, msg: "Not found" });
    }
  });
};
