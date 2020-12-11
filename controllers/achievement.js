const Achievement = require("../models/Achievement");

//Add archivement for testing
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
        return res.status(400).json({ success: false, data: "no achievements" });
      }
      return res.status(200).json({ success: true, data: achievements });
    })
    .catch((err) => console.log(err));
};
