const express = require('express');
const cc = require('cryptocompare');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json({ extended: true }));
app.use(require("cors")());

app.use(express.static(path.resolve(__dirname, "./public")));

app.use(require("./routes/index.routes"));

module.exports = app;