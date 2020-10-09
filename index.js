// import express from 'express';
const express = require("express");

// Listen to node and route http request to the route handler
const app = express();

app.get("/", (req, res) => {
  res.send({ bye: "buddy" });
});


// In develpment use port 5000
// In production use provided port from Heroku
const PORT = process.env.PORT || 5000;
app.listen(PORT);
