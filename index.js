const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cookieSession = require("cookie-session");
const passport = require("passport");
const keys = require("./config/keys");
require("./models/User");
require("./services/passport");

mongoose.connect(keys.mongoURI);

// Listen to node and route http request to the route handler
const app = express();

const practiceRoutes = require("./routes/practice");

// Setting up basic middleware for all Express requests
app.use(bodyParser.urlencoded({ extended: false })); // Parses urlencoded bodies
app.use(bodyParser.json()); // Send JSON responses

// app.use(
//   cookieSession({
//     maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
//     keys: [keys.cookieKey],
//   })
// );
// app.use(passport.initialize());
// app.use(passport.session());

// In develpment use port 5000
// In production use provided port from Heroku
const PORT = process.env.PORT || 5000;
app.listen(PORT);

require("./routes/authRoutes")(app);

app.use("/practice", practiceRoutes);

// app.use((req, res, next) => {
//   res.status(404).render('404', { pageTitle: ' Page Not Found'});
// })
