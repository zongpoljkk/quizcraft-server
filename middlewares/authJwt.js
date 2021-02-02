const jwt = require("jsonwebtoken");
const config = require("../config/keys");

const getRefreshToken = (userId,role) => {
  const token = jwt.sign({userId: userId, role: role}, config.secret, {
    expiresIn: 14400 // 4 hours
  });
  return token;
}

const verifyToken = (req, res, next) => {
  let token = req.header("Authorization");
  if (!token) {
    return res
      .status(403)
      .json({ success: false, error: "No token provided!" });
  }
  if (token.startsWith("Bearer ")) {
    // Remove Bearer from string
    token = token.slice(7, token.length).trimLeft();
  } else {
  }
  jwt.verify(token, config.secret, (err, decoded) => {
    if (err)
      return res.status(401).json({ success: false, error: "Unauthorized!" });
    req.userId = decoded.userId;
    req.role = decoded.role;
    if (decoded.exp*1000 - Date.now() <= 9000000) { //less than 15 min
      const refreshToken = getRefreshToken(decoded.userId,decoded.role);
      res.header("refresh-token",refreshToken);
    }
    next();
  });
};

const authJwt = (req, res, next) => {
  verifyToken(req, res, next);
};

module.exports = authJwt;
