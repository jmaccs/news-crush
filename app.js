const express = require("express");
const { getTopics, getApi } = require("./controller/api-controllers");
const app = express();

app.use(express.json());

app.get("/api/topics", getTopics);

app.get("/api", getApi)

module.exports = app;
