const express = require("express");
const app = express();

app.use(require("./crypto.routes"));

module.exports = app;