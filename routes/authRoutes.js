const passport = require("passport");

module.exports = (app) => {
  app.get(
    "/auth/google",
    // "google" : use GoogleStrategy
    passport.authenticate("google", {
      // scope: What kind of information servers want from user
      scope: ["profile", "email"],
    })
  );

  // Diffrence between this one and the one above is right now there is a code=? as part of the URL
  app.get("/auth/google/callback", passport.authenticate("google"));

  app.get('/api/logout', (req, res) => {
    req.logout();
    res.send(req.user);
  })

  app.get("/api/current_user", (req, res) => {
    res.send(req.user);
  });
};
