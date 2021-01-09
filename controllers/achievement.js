const Achievement = require("../models/Achievement");
const User = require("../models/User");

exports.addFile = (req, res) => {
  const achievementName = req.body.achievementName;
  const image = req.files.image;
  const lottie = req.files.lottie;
  Achievement.findOne({ name: achievementName })
    .select("_id photo")
    .exec((err, achievement) => {
      if (err) {
        res
          .status(500)
          .send({ success: false, error: "Internal Server Error" });
      } else if (!achievement) {
        res.status(400).send({
          success: false,
          error: "Unable to find user with the given ID",
        });
      }
      achievement.image = image;
      achievement.lottie = lottie;
      achievement.save();
      res.status(200).send({ success: true, data: "Upload succeeded" });
    });
};

//Add achievement for testing
exports.addAchievement = (req, res, next) => {
  const achievement = new Achievement(req.body);
  achievement.save((err, newAchievement) => {
    if (err) res.send(err);
    else if (!newAchievement) res.send(400);
    else res.send(newAchievement);
    next();
  });
};

exports.getAllAchievements = async (req, res) => {
  await Achievement.find()
    .exec((err, achievements) => {
      if (err) {
        return res.status(500).json({ success: false, error: err });
      }
      if (!achievements.length) {
        return res
          .status(400)
          .json({ success: false, data: "no achievements" });
      }
      return res.status(200).json({ success: true, data: achievements });
    })
    .catch((err) => console.log(err));
};

exports.getMyAchievements = (req, res) => {
  console.log("KDSALDKAS");
  const userId = req.query.userId;

  User.findById(userId)
    .exec()
    .then((user) => {
      if (!user) {
        res.status(400).json({
          success: false,
          error: "There is a problem getting your achievements :(",
        });
      }
      res.status(200).json({ success: true, data: user.achievements });
    })
    .catch((err) => {
      console.log(err);
    });
};
