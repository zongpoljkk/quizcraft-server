const authJwt = require("./authJwt");
const verifyRegister = require("./verifyRegister")
const adminOnly = require("./verifyAdmin")

module.exports = { 
  authJwt, 
  verifyRegister,
  adminOnly
};
