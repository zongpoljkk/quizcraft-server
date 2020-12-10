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

// exports.getProfileByUID = (req, res) => {
//   User.findOne({ _id: req.query._id }, (err, user) => {
//     if(err) {
//       return res.status(500).json({ success: false, error: err })
//     }
//     else if (!user) {
//       return res
//         .status(400)
//         .json({ success: false, error: `User not found` })
//     }
//     else return res.status(200).json({ success: true, data: user })
//   });
// }

exports.getProfileByUID = async (req, res) => {
  await User.aggregate(
    [
      {
        $match: {
          username: req.query.username //should be id
        },
      },
      {
        $lookup: {
          from: "items",
          localField: "items.itemID",
          foreignField: "_id",
          as: "items",
        },
      },
      {
        $lookup: {
          from: "achievements",
          localField: "achievements.achievementID",
          foreignField: "_id",
          as: "achievements",
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