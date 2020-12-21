const jwt = require("jsonwebtoken");
const config = require("../config/keys");

const verifyToken = (req, res, next) => {
  console.log(req);
  let token = req.header('Authorization');
  if (!token) {
    return res.status(403).json({ success: false, error: "No token provided!" });
  }
  if (token.startsWith('Bearer ')) {
    // Remove Bearer from string
    token = token.slice(7, token.length).trimLeft();
  } else {}
  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) return res.status(401).json({ success: false, error: "Unauthorized!" })
    req.userId = decoded.userId;
    req.role = decoded.role;
    next();
  })
}

const authJwt = (req, res, next) => {
  verifyToken(req, res, next);
};

module.exports = authJwt;