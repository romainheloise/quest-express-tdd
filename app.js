// app.js
const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();
const connection = require("./connection");

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.status(200).json({ message: "Hello World!" });
});

app.post("/bookmarks", async (req, res) => {
  if (Object.values(req.body).length === 0) {
    res.status(422).json({ error: "required field(s) missing" });
    return;
  }

  const postOne = await new Promise((resolve, reject) => {
    connection.query("INSERT INTO bookmark SET ?", req.body, (err, result) => {
      if (err) reject(err);
      resolve(result);
    });
  });

  const result = await new Promise((resolve, reject) => {
    connection.query(
      "SELECT * FROM bookmark WHERE id = ?",
      postOne.insertId,
      (err, result) => {
        if (err) reject(err);
        resolve(result);
      }
    );
  });
  res.status(201).json(result[0]);
});

app.get("/bookmarks/:id", async (req, res) => {
  const bookmark = await new Promise((resolve, reject) => {
    connection.query(
      "SELECT * FROM bookmark WHERE id = ?",
      req.params.id,
      (err, result) => {
        if (err) reject(err);
        resolve(result[0]);
      }
    );
  });

  if (!bookmark) {
    res.status(404).json({ error: "BookMark not found" });
    return;
  }

  res.status(200).json(bookmark);
});

module.exports = app;
