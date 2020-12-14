// import express from 'express';
const express = require("express");
const mongoose = require("mongoose");
const cookieSession = require("cookie-session");
const keys = require("./config/keys");
const bodyParser = require("body-parser");
const multer = require("multer");
const cors = require("cors");

const problemRouter = require("./routes/problem");
const subtopicRouter = require("./routes/subtopic");
const hintRouter = require("./routes/hint");
const userRouter = require("./routes/user");
const itemRouter = require("./routes/item");
const achievementRouter = require("./routes/achievement");

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

// To upload image to server side
// app.use(
//   multer({
//     dest: `./uploads/`,
//     rename: function (fieldname, filename) {
//       return filename;
//     },
//   }).single("image")
// );
// Create storage engine
// const storage = new GridFsStorage({
//   url: keys.mongoURI,
//   file: (req, file) => {
//     return new Promise((resolve, reject) => {
//       crypto.randomBytes(16, (err, buf) => {
//         if (err) {
//           return reject(err);
//         }
//         const filename = file.originalname;
//         const fileInfo = {
//           filename: filename,
//           bucketName: "uploads",
//         };
//         resolve(fileInfo);
//       });
//     });
//   },
// });

// const upload = multer({ storage });

// In develpment use port 5000
// In production use provided port from Heroku
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server is running"));

app.use("/api/problem", problemRouter);
app.use("/api/subtopic", subtopicRouter);
app.use("/api/hint", hintRouter);
app.use("/api/user", userRouter);
app.use("/api/item", itemRouter);
app.use("/api/achievement", achievementRouter);

// app.use((req, res, next) => {
//   res.status(404).render('404', { pageTitle: ' Page Not Found'});
// })
