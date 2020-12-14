const e = require("express");
const fs = require(`fs`);

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
    .catch((err) => console.log(err));
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
    }
  ).catch((err) => console.log(err));
};

exports.EditUsername = async (req, res) => {
  const body = req.body;
  if (!body) {
    return res.status(400).json({
      success: false,
      error: "You must provide a body to update",
    });
  }

  User.findOne({ _id: req.body._id }, (err, user) => {
    if (err) {
      return res.status(404).json({
        err,
        message: "User not found!",
      });
    }
    user.username = body.username;

    user
      .save()
      .then(() => {
        var newUsername = new User({ _id: user.id, username: user.username });
        newUsername.save();
        return res.status(200).json({
          success: true,
          data: { _id: user._id, username: user.username },
        });
      })
      .catch((error) => {
        return res.status(404).json({
          success: false,
          error,
          message: "Username not updated!",
        });
      });
  });
};

exports.changeProfilePicture = (req, res, next) => {
  // console.log(req);
  const userId = req.body.userId;
  User.findById(userId)
    .select("_id photo")
    .exec((err, user) => {
      if (err) {
        res.status(500).send("Internal Server Error");
      } else if (!user) {
        res.status(400).send("Unable to find user with the given ID");
      }
      console.log(user);
      console.log(req.body);
      console.log(req.file);
      console.log(user.photo);
      user.photo = req.file;
      // user.photo = fs.readFileSync(req.file.path);
      // console.log(user.photo);
      // user.photo = fs.readFileSync(req.files.userPhoto);
      // user.photo.contentType = `image/jpg`;
      user.save();
      res.status(201).send("Upload succeeded");
    });
};

exports.getProfilePicture = (req, res, next) => {
  const userId = req.query.userId;
  User.findById(userId)
    .select("_id, photo")
    .exec((err, user) => {
      res.send(user);
    });
  // res.send("Getting profile picture");
};
