const Item = require("../models/Item");
const User = require("../models/User");

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
  await User.find()
    .exec((err, users) => {
      if (err) {
        return res.status(500).json({ success: false, error: err });
      }
      if (!users.length) {
        return res.status(400).json({ success: false, data: "no users" });
      }
      return res.status(200).json({ success: true, data: users });
    })
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
          localField: "items.itemID",
          foreignField: "_id",
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
                          cond: { $eq: ["$$fromItem._id", "$$item.itemID"] },
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
        },
      },
    ],
    (err, user) => {
      if (err) {
        return res.status(500).json({ success: false, error: err });
      }
      if (!user.length) {
        return res.status(400).json({ success: false, data: "no users" });
      }
      return res.status(200).json({ success: true, data: user });
    })
};

exports.editUsername = async (req, res) => {
  const body = req.body;
  if (!body) {
    return res.status(400).json({
      success: false,
      error: "You must provide a body to update",
    });
  }

  const regex = RegExp('^(?=[a-zA-Zก-๛_\d]*[a-zA-Zก-๛])[-a-zA-Zก-๛0-9_\d]{5,12}$');
  const usernameValidate = regex.test(body.username);

  if (body.username == null || body.username.trim().length == 0 ){
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

  User.findOne({ username: req.body.username },(err, user) => {
    if (err) {
      return res.status(500).json({ success: false, error: err });
    }
    if (!user && usernameValidate) {
      User.findOneAndUpdate(
        { _id: req.body.userId },
        { username : req.body.username }, 
        { new: true },
        (err, user) => {
          if (err) {
            return res.status(500).json({ success: false, error: err });
          }
          if (!user) {
            return res.status(400).json({ success: false, error: "no data" });
          }
          return res.status(200).json({ success: true, data: { userId: user._id, username: user.username } });
      });
    }
    else{
      return res.status(400).json({ success: false, error: "already have this username!" });
    }
});
};