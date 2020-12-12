const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const config = require("../config/keys")

exports.register = async (req,res) => {
  //Hash password
  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(req.body.password, salt);
  var user;
  //Create User
  if (req.body.role) {
    user = new User({
      name: req.body.name,
      username:req.body.username,
      password: hashPassword,
      school: req.body.school,
      class: req.body.class,
      role: req.body.role,
    });
  } else {
    user = new User({
      name: req.body.name,
      username:req.body.username,
      password: hashPassword,
      school: req.body.school,
      class: req.body.class,
    });
  }
  user.save((err,newUser) => {
    if (err) return res.status(500).json({ success: false, error: err });
    else if (!newUser) return res.status(400).json({ success: false, error: "Cannot register" });
    else {
      return res.status(200).json({ success: true, msg: "User was registered successfully!" });
    }
  });
}

exports.login = async (req,res) => {
  try {
    const user = await User.findOne({username: req.body.username}).select("+password");
    if (user) {
      const validPass = await bcrypt.compare(req.body.password, user.password);
      if (!validPass) return res.status(400).json({ success: false, error: "Wrong username or password" });
      
      //Create and assign token
      const token = jwt.sign({userId: user._id, role: user.role}, config.secret, {
        expiresIn: 14400 // 4 hours
      });
      return res.header("auth-token",token).status(200).json({ success: true, token: token});
    } else {
      return res.status(400).json({ success: false, err: "Wrong username or password" });
    }
  } 
  catch (err) {
    return res.status(500).json({ success: false, error: err });
  }
}
