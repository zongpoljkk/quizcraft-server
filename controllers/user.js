const User = require("../models/User");
const jwt = require("jsonwebtoken");
const config = require("../config/keys");

//Add user for testing
exports.addUser = (req, res, next) => {
  const user = new User(req.body);
  user.save((err, newUser) => {
    if (err) res.send(err);
    else if (!newUser) res.send(400);
    else res.send(newUser);
    next();
  });
};

exports.getAllUsers = async (req, res) => {
  await User.find().exec((err, users) => {
    if (err) {
      return res.status(500).json({ success: false, error: err });
    }
    if (!users.length) {
      return res.status(400).json({ success: false, data: "no users" });
    }
    return res.status(200).json({ success: true, data: users });
  });
};

exports.getProfileByUID = async (req, res) => {
  var mongoose = require("mongoose");
  const _id = req.query._id;
  await User.aggregate(
    [
      {
        $match: {
          _id: mongoose.Types.ObjectId(_id),
        },
      },
      {
        $lookup: {
          from: "items",
          localField: "items.itemName",
          foreignField: "name",
          as: "fromItems",
        },
      },
      {
        $addFields: {
          itemInfos: {
            $map: {
              input: "$items",
              as: "item",
              in: {
                $mergeObjects: [
                  "$$item",
                  {
                    $arrayElemAt: [
                      {
                        $filter: {
                          input: "$fromItems",
                          as: "fromItem",
                          cond: { $eq: ["$$fromItem.name", "$$item.itemName"] },
                        },
                      },
                      0,
                    ],
                  },
                ],
              },
            },
          },
        },
      },
      {
        $project: {
          items: 0,
          fromItems: 0,
          achievements: 0,
          __v: 0,
          "itemInfos.name": 0,
          "itemInfos.price": 0,
          "itemInfos.description": 0,
          "itemInfos.__v": 0,
          "itemInfos._id": 0,
        },
      },
    ],
    (err, user) => {
      if (err) {
        return res.status(500).json({ success: false, error: err });
      }
      if (!user.length) {
        return res.status(400).json({ success: false, error: "no users" });
      }
      return res.status(200).json({ success: true, data: user });
    }
  );
};

exports.editUsername = async (req, res) => {
  let token = req.header('Authorization');
  var userIdFromToken
  if (!token) {
    return res.status(403).json({ success: false, error: "No token provided!" });
  }
  if (token.startsWith('Bearer ')) {
    token = token.slice(7, token.length).trimLeft();
  } else {}
  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) return res.status(401).json({ success: false, error: "Unauthorized!" })
    userIdFromToken = decoded.userId;
  })

  const body = req.body;
  if (!body) {
    return res.status(400).json({
      success: false,
      error: "You must provide a body to update",
    });
  }

  if (userIdFromToken !== body.userId) {
    return res.status(400).json({
      success: false,
      error: "userId not match userId that decoded from token!",
    });
  }

  const regex = RegExp(
    "^(?=[a-zA-Zก-๛_d]*[a-zA-Zก-๛])[-a-zA-Zก-๛0-9_d]{5,12}$"
  );
  const usernameValidate = regex.test(body.username);

  if (body.username == null || body.username.trim().length == 0) {
    return res.status(400).json({
      success: false,
      error: "Username cannot be blank!",
    });
  }

  if (!usernameValidate) {
    return res.status(400).json({
      success: false,
      error: "Username format is not correct!",
    });
  }

  User.findOne({ username: req.body.username }, (err, user) => {
    if (err) {
      return res.status(500).json({ success: false, error: err });
    }
    if (!user && usernameValidate) {
      User.findOneAndUpdate(
        { _id: req.body.userId },
        { username: req.body.username },
        { new: true },
        (err, user) => {
          if (err) {
            return res.status(500).json({ success: false, error: err });
          }
          if (!user) {
            return res.status(400).json({ success: false, error: "no data" });
          }
          return res.status(200).json({
            success: true,
            data: { username: user.username },
          });
        }
      );
    }
    else{
      return res.status(400).json({ success: false, error: "already have this username!" });
    }
});
};

exports.usedItem = async (req, res) => {
  let token = req.header('Authorization');
  var userIdFromToken
  if (!token) {
    return res.status(403).json({ success: false, error: "No token provided!" });
  }
  if (token.startsWith('Bearer ')) {
    token = token.slice(7, token.length).trimLeft();
  } else {}
  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) return res.status(401).json({ success: false, error: "Unauthorized!" })
    userIdFromToken = decoded.userId;
  })

  const body = req.body;
  if (!body) {
    return res.status(400).json({
      success: false,
      error: "You must provide a body to update",
    });
  }

  if (userIdFromToken !== body.userId) {
    return res.status(400).json({
      success: false,
      error: "userId not match userId that decoded from token!",
    });
  }

  User.findOne(
    {
      _id: req.body.userId,
      items: {
        $elemMatch: {
          itemName: req.body.itemName,
          amount: { $eq: 0 },
        },
      },
    },
    (err, user) => {
      if (err) {
        return res.status(500).json({ success: false, error: err });
      }
      if (!user) {
        User.findOneAndUpdate(
          { _id: req.body.userId,
            items: {
              $elemMatch: {
                itemName: req.body.itemName,
                amount: { $gt: 0 }
              }
            }
          },
          { $inc: { "items.$.amount" : -1 } },
          { new: true },
          (err, user) => {
            if (err) {
              return res.status(500).json({ success: false, error: err });
            }
            if (!user) {
              return res.status(400).json({ success: false, error: "no data" });
            }
            let items = user.items
            let index = items.findIndex(x => x.itemName === body.itemName);
            return res.status(200).json({ success: true, data: user.items[index] });
        });
      } else {
        return res
          .status(400)
          .json({ success: false, error: "cannot use this item bc amount = 0!" });
      }
    }
  );
};

exports.changeProfilePicture = (req, res, next) => {
  const userId = req.body.userId;
  User.findById(userId)
    .select("_id photo")
    .exec((err, user) => {
      if (err) {
        res
          .status(500)
          .send({ success: false, error: "Internal Server Error" });
      } else if (!user) {
        res.status(400).send({
          success: false,
          error: "Unable to find user with the given ID",
        });
      }
      user.photo = req.file;
      user.save();
      res.status(200).send({ success: true, data: "Upload succeeded" });
    });
};

exports.updateStreak = async (userId) => {
  const now = new Date();
  const user = await User.findOneAndUpdate({ _id: userId }, { lastLogin: now });
  const lastLoginDate = new Date(user.lastLogin);
  const nextDate = new Date(user.lastLogin);
  nextDate.setDate(nextDate.getDate() + 1);
  if (now.toDateString() == lastLoginDate.toDateString()) {
    //same day, do nothing
    console.log("sameday");
    return;
  } else if (now.toDateString() == nextDate.toDateString()) {
    //inc streak by 1
    await User.findOneAndUpdate(
      {
        _id: userId,
      },
      {
        $inc: {
          streak: 1,
        },
      }
    );
    console.log("inc streak");
    return;
  } else {
    //set streak to 0
    await User.findOneAndUpdate(
      {
        _id: userId,
      },
      {
        streak: 0,
      }
    );
    console.log("set 0");
    return;
  }
};
