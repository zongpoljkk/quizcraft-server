const User = require("../models/User");
const Counter = require("../models/Counter");
const jwt = require("jsonwebtoken");
const config = require("../config/keys");
const axios = require('axios');
const { updateStreak } = require("./user");

const tokenURL = "https://www.mycourseville.com/api/oauth/access_token";
const userURL = "https://www.mycourseville.com/api/v1/public/users/me";

const getNextSequenceValue = async (field) => {
  var sequence = await Counter.findOneAndUpdate(
    {
      field: field,
    },
    {
      $inc: {
        sequenceValue: 1,
      },
    },
    { upsert: true, new: true }
  );
  return `${sequence.sequenceValue}`;
};

exports.loginViaMCV = async (req, res) => {
  const code = req.body.code;
  var accessToken;
  var mcvUserInfo;
  var user;
  const data = {
    grant_type: "authorization_code",
    client_id: config.mcvClientId,
    client_secret: config.mcvClientSecret,
    redirect_uri: config.redirect_uri,
    code: code
  }
  try {
    await axios.post(tokenURL, data
      ).then((res) => {
        accessToken = res.data.access_token;
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
        user = await user.save();
      }
      //update streak
      await updateStreak(user._id);
      //Create and assign token
      const token = jwt.sign({userId: user._id, role: user.role}, config.secret, {
        expiresIn: 14400 // 4 hours
      });
      const refreshToken = jwt.sign({userId: user._id, role: user.role}, config.refreshSecret, {
        expiresIn: 14400 + 900 // 4 hours + 15 min
      });
      return res.status(200).json({ success: true, token: token, refreshToken: refreshToken});
    } else {
      console.log('Cannot get data from MCVplatefrom');
      return res.status(400).json({ success: false, error: "Something went wrong!" });
    }
  } catch (err) {
    console.log(err)
    return res.status(500).json({ success: false, error: err.toString()});
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

exports.refreshToken = async (req, res) => {
  const refreshToken = req.body.refreshToken;
  var userId, role;
  if (!refreshToken) {
    return res.status(400).json({ success: false, error: "Not have refresh token!", from: "refresh token"});
  }
  try {
    jwt.verify(refreshToken, config.refreshSecret, (err, decoded) => {
      if (err) {
        return res.status(401).json({ success: false, error: "Unauthorized by refresh token", from: "refresh token" });
      } else {
        userId = decoded.userId;
        role = decoded.role;
        const token = jwt.sign({userId: userId, role: role}, config.secret, {
          expiresIn: 14400 // 4 hours
        });
        const newRefreshToken = jwt.sign({userId: userId, role: role}, config.refreshSecret, {
          expiresIn: 14400 + 900 // 4 hours + 15 min
        });
        return res.status(200).json({ success: true, token: token, refreshToken: newRefreshToken});
      }
    });
  } catch (err) {
    return res.status(401).json({ success: false, error: err.toString(), from: "refresh token" });
  }
}
