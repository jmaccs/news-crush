const db = require("../db/connection");
const format = require("pg-format");
const { checkExists, validator } = require("../utils/utils");

exports.getAllTopics = () => {
  return db.query("SELECT * FROM topics;").then((topics) => {
    return topics.rows;
  });
};

exports.selectArticle = (article_id) => {
  const sql = format(`SELECT a.*, (SELECT COUNT(*) FROM comments WHERE article_id = a.article_id)::int AS comment_count
  FROM articles a
  WHERE a.article_id = $1
  ORDER BY a.created_at ASC;
 `);
  return db.query(sql, [article_id]).then(({ rows }) => {
    const article = rows[0];

    if (!article) {
      return Promise.reject({ status: 404, msg: "Not found" });
    }
    return article;
  });
};
exports.getAllArticles = (topic) => {
  let valueArr = [];
  let query = `
    SELECT articles.*,
           COUNT(comments.article_id)::int AS comment_count
    FROM articles  
    LEFT JOIN comments ON comments.article_id = articles.article_id
  `;
  let groupAndOrder = `
    GROUP BY articles.article_id
    ORDER BY articles.created_at DESC
  `;

  if (topic) {
    return checkExists("topics", "slug", topic).then(() => {
      query += ` WHERE articles.topic = $1`;
      query += groupAndOrder;
      valueArr.push(topic);
      return db.query(query, valueArr).then((data) => {
        return data.rows;
      });
    });
  } else {
    query += groupAndOrder;
    return db.query(query).then((data) => {
      return data.rows;
    });
  }
};

exports.selectComments = (article_id) => {
  let sql = `
    SELECT *
    FROM comments
    WHERE article_id = $1
    ORDER BY created_at DESC;
  `;
  return checkExists("articles", "article_id", article_id).then(() => {
    return db.query(sql, [article_id]).then((data) => {
      if (!data) {
        return [];
      }
      return data.rows;
    });
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

exports.getAllUsers = () => {
  return db.query("SELECT * FROM users;").then((data) => {
    return data.rows;
  });
};
