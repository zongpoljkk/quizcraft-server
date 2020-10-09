// import express from 'express';
const express = require("express");

// Listen to node and route http request to the route handler
const app = express();

app.get("/", (req, res) => {
  res.send({ hi: "there" });
});

app.listen(5000);
