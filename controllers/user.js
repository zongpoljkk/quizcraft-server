const User = require("../models/User");

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

exports.getProfileByUID = (req, res) => {
  User.findOne({ _id: req.query._id }, (err, user) => {
    if(err) {
      return res.status(500).json({ success: false, error: err })
    }
    else if (!user) {
      return res
        .status(400)
        .json({ success: false, error: `User not found` })
    }
    else return res.status(200).json({ success: true, data: user })
  });
}
