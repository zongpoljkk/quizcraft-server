const User = require("../models/User");

const checkDuplicateUsername = (req, res, next) => {
  User.findOne({username: req.body.username}).exec((err, user) => {
    if (err) return res.status(500).json({ success: false, error: err });
    if (user) return res.status(400).json({ success: false, error: "Failed! Username is already in use!"});
    next();
  })
}

const verifyRegister = (req, res, next) => {
  checkDuplicateUsername(req, res, next);
}

module.exports = verifyRegister;