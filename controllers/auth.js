const User = require("../models/User");
const Counter = require("../models/Counter");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const config = require("../config/keys");
const axios = require('axios');
const { updateStreak } = require("./user")

const tokenURL = "https://www.mycourseville.com/api/oauth/access_token";
const userURL = "https://www.mycourseville.com/api/v1/public/users/me";

const getNextSequenceValue = async (field) => {
  var sequence = await Counter.findOneAndUpdate({
    field: field
  },{
    $inc: {
      sequenceValue:1
    }
  });
  return `${sequence.sequenceValue}`;
}

exports.loginViaMCV = async (req, res) => {
  const code = req.body.code;
  var accessToken;
  var refreshToken;
  var mcvUserInfo;
  var user;
  const data = {
    grant_type: "authorization_code",
    client_id: config.mcvClientId,
    client_secret: config.mcvClientSecret,
    redirect_uri: "http://localhost:3000/oauth/mcv-callback",
    code: code
  }
  await axios.post(tokenURL, data
    ).then((res) => {
      accessToken = res.data.access_token;
      refreshToken = res.data.refresh_token;
    }).catch((err) => {
      console.log("err post token")
      return res.status(400).json({ success: false, error: "err post token" });
    });

  //get info from mcv
  const requestHeader = {
    Authorization: `Bearer ${accessToken}`,
  }
  await axios.get(userURL, {headers: requestHeader}
    ).then((res) => {
      mcvUserInfo = res.data;
    }).catch((err)=> {
    console.log('err get mcv user info')
    return res.status(400).json({ success: false, error: "err get mcv user info" });
  });
  
  //login or createUser
  if(mcvUserInfo.status == 'success'){
    try {
      user = await User.findOne({smartSchoolAccount:mcvUserInfo.user.id});
    } catch (err) {
      return res.status(500).json({succes: false, error:err});
    }
    if (!user) {
      let inc = await getNextSequenceValue('username');
      let num = '';
      if (inc.length < 4) {
        for(i=0; i<4-inc.length; i++) {
          num += '0';
        }
        num += inc;
      }
      user = new User({
        firstname: mcvUserInfo.user.firstname_th,
        lastname: mcvUserInfo.user.lastname_th,
        smartSchoolAccount: mcvUserInfo.user.id,
        username: `qc${num}`
      });
      user.save((err, newUser) => {
        if (err) return res.status(500).json({ success: false, error: err });
        else if (!newUser) return res.status(400).json({ success: false, error: "Cannot add new user" });
      });
    }
    //update streak
    updateStreak(user._id);
    //Create and assign token
    const token = jwt.sign({userId: user._id, role: user.role}, config.secret, {
      expiresIn: 14400 // 4 hours
    });
    return res.header("auth-token",token).status(200).json({ success: true, token: token});
  } else {
    console.log('Cannot get data from MCVplatefrom');
    return res.status(400).json({ success: false, error: "Something went wrong!" });
  }
}

//for testing
exports.register = async (req,res) => {
  var user;
  //Create User
  if (req.body.role) {
    user = new User({
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      username:req.body.username,
      school: req.body.school,
      class: req.body.class,
      role: req.body.role,
    });
  } else {
    user = new User({
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      username:req.body.username,
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

