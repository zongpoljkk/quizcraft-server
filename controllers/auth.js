const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const config = require("../config/keys");
const passport = require("passport");
const OAuth2Strategy = require("passport-oauth2");
const axios = require('axios');

const tokenURL = "https://www.mycourseville.com/api/oauth/access_token";
const userURL = "https://www.mycourseville.com/api/v1/public/users/me"

exports.loginViaMCV = async (req, res) => {
  //redirect
  var accessToken;
  var refreshToken;
  var mcvUserInfo;
  const code = req.query.code;
  console.log("code",code)
  const data = {
    grant_type: "authorization_code",
    client_id: config.mcvClientId,
    client_secret: config.mcvClientSecret,
    redirect_uri: "http://localhost:5000/api/auth/mcv-callback",
    code: code
  }
  const headers = {
    accept: "application/json"
  }
  await axios.post(tokenURL, data
    ).then((res) => {
      accessToken = res.data.access_token;
      refreshToken = res.data.refresh_token;
      console.log("accessToken",accessToken)
      console.log("refreshToken",refreshToken)
    }).catch((err) => {
      console.log("err post token")
    });
  
  //get info from mcv
  const requestHeader = {
    Authorization: `Bearer ${accessToken}`,
  }
  console.log(requestHeader)
  await axios.get(userURL, {headers: requestHeader}
    ).then((res) => {
      mcvUserInfo = res.data;
    }).catch((err)=> {
    console.log('err get mcv user info')
  });
  console.log("mcvUserInfo",mcvUserInfo)
  //mcvUserInfo contain user data such as id that will be map to smartSchoolAccount in User schema
  //have to check that user already have in database or not, if not create and save, if in database, get user, then sign token to user
  //todo 
  //redirect to homepage
  return res.redirect('http://localhost:3000')
}

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
