// import express from 'express';
const express = require("express");
const mongoose = require("mongoose");
const cookieSession = require("cookie-session");
const keys = require("./config/keys");
const bodyParser = require("body-parser");
const cors = require("cors");

const problemRouter = require("./routes/problem");
const subtopicRouter = require("./routes/subtopic");
const practiceRouter = require("./routes/practice");
const hintRouter = require("./routes/hint");
const authRouter = require("./routes/auth");
const userRouter = require("./routes/user");
const itemRouter = require("./routes/item");
const achievementRouter = require("./routes/achievement");
const leaderboardRouter = require("./routes/leaderBoard");
const englishRouter = require("./routes/english");
const challengeRouter = require("./routes/challenge");
const reportRouter = require("./routes/report");
const groupRouter = require("./routes/group");

mongoose.set("useNewUrlParser", true);
mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);
mongoose.set("useUnifiedTopology", true);

mongoose.connect(keys.mongoURI, () => {
  console.log("Connected to db");
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

app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

// In develpment use port 5000
// In production use provided port from Heroku
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server is running"));

app.use("/api/practice", practiceRouter);
app.use("/api/problem", problemRouter);
app.use("/api/subtopic", subtopicRouter);
app.use("/api/hint", hintRouter);
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/item", itemRouter);
app.use("/api/achievement", achievementRouter);
app.use("/api/leader-board", leaderboardRouter);
app.use("/api/english", englishRouter);
app.use("/api/challenge", challengeRouter);
app.use("/api/report", reportRouter);
app.use("/api/group", groupRouter);

// app.use((req, res, next) => {
//   res.status(404).render('404', { pageTitle: ' Page Not Found'});
// })
