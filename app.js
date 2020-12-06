// import express from 'express';
const express = require('express');
const mongoose = require('mongoose');
const cookieSession = require('cookie-session');
const keys = require('./config/keys');
const bodyParser = require("body-parser");

const problemRouter = require('./routes/problem');
const subtopicRouter = require('./routes/subtopic');
const practiceRouter = require('./routes/practice');

mongoose.connect(keys.mongoURI, () => {
    console.log("Connected to db")
});

// Listen to node and route http request to the route handler
const app = express();

app.use(bodyParser.json());
app.use(
  cookieSession({
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    keys: [keys.cookieKey],
  })
);

// In develpment use port 5000
// In production use provided port from Heroku
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log('Server is running'));

app.use('/api/problem', problemRouter);
app.use('/api/subtopic', subtopicRouter);
app.use("/api/practice", practiceRouter);

// app.use((req, res, next) => {
//   res.status(404).render('404', { pageTitle: ' Page Not Found'});
// })