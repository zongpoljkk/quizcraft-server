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

// exports.getAllAchievements = async (req, res) => {
//   await Achievement.find()
//     .exec((err, achievements) => {
//       if (err) {
//         return res.status(500).json({ success: false, error: err });
//       }
// if (!achievements.length) {
//   return res
//     .status(400)
//     .json({ success: false, data: "no achievements" });
// }
//       return res.status(200).json({ success: true, data: achievements });
//     })
//     .catch((err) => console.log(err));
// };

// TODO: Maybe in the future we display all achievements in achievements page and gray the one user haven't got
exports.getAllAchievements = async (req, res) => {
  try {
    await Achievement.aggregate(
      [
        {
          $lookup: {
            from: "media.chunks",
            localField: "image.id",
            foreignField: "files_id",
            as: "image_info",
          },
        },
        { $unwind: "$image_info" },
        {
          $lookup: {
            from: "media.chunks",
            localField: "lottie.id",
            foreignField: "files_id",
            as: "lottie_info",
          },
        },
        { $unwind: "$lottie_info" },
        {
          $project: {
            _id: 1,
            name: 1,
            description: 1,
            "image_info.data": 1,
            "lottie_info.data": 1,
          },
        },
      ],
      (err, achievements) => {
        if (err) {
          return res.status(500).json({ success: false, error: err });
        }
        if (!achievements.length) {
          return res
            .status(400)
            .json({ success: false, data: "no achievements" });
        }
        return res.status(200).json({ success: true, data: achievements });
      }
    );
  } catch (err) {
    console.log(err);
  }
};

exports.getMyAchievements = async (req, res) => {
  console.log("getMyAchievements");
  const userId = req.query.userId;

  await User.findById(userId)
    .exec()
    .then(async (user) => {
      if (!user) {
        res.status(400).json({
          success: false,
          error: "There is a problem getting your achievements :(",
        });
      }

      const user_achievement_names = user.achievements.map((achievement) => {
        return achievement.achievementName;
      });

      console.log(user_achievement_names);

      await Achievement.aggregate(
        [
          {
            $match: { name: { $in: user_achievement_names } },
          },
          {
            $lookup: {
              from: "media.chunks",
              localField: "image.id",
              foreignField: "files_id",
              as: "image_info",
            },
          },
          { $unwind: "$image_info" },
          {
            $lookup: {
              from: "media.chunks",
              localField: "lottie.id",
              foreignField: "files_id",
              as: "lottie_info",
            },
          },
          { $unwind: "$lottie_info" },
          {
            $project: {
              _id: 1,
              name: 1,
              description: 1,
              "image_info.data": 1,
              "lottie_info.data": 1,
            },
          },
        ],
        (err, achievements) => {
          if (err) {
            return res.status(500).json({ success: false, error: err });
          }
          if (!achievements.length) {
            return res
              .status(400)
              .json({ success: false, data: "no achievements" });
          }
          return res.status(200).json({ success: true, data: achievements });
        }
      );
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.checkAchievement = async (req, res) => {
  // Handle Streaks
  const streaks = +req.query.streaks;

  switch (streaks) {
    case 7:
      return res
        .status(200)
        .json({ success: true, data: "You got จับฉันให้ได้สิ" });
    case 14:
      return res
        .status(200)
        .json({ success: true, data: "You got จับฉันไม่ได้หรอก" });
    case 28:
      return res
        .status(200)
        .json({ success: true, data: "You got ให้ตายก็ไม่มีทางจับฉันได้" });
  }

  const user_achievement_names = ["จับฉันให้ได้สิ", "จับฉันไม่ได้หรอก"];

  await Achievement.aggregate(
    [
      {
        $match: { name: { $in: user_achievement_names } },
      },
      {
        $lookup: {
          from: "media.chunks",
          localField: "lottie.id",
          foreignField: "files_id",
          as: "lottie_info",
        },
      },
      { $unwind: "$lottie_info" },
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          rewardEXP: 1,
          rewardCoin: 1,
          "lottie_info.data": 1,
        },
      },
    ],
    (err, achievements) => {
      if (err) {
        return res.status(500).json({ success: false, error: err });
      }
      if (!achievements.length) {
        return res
          .status(400)
          .json({ success: false, data: "no achievements" });
      }
      return res.status(200).json({ success: true, data: achievements });
    }
  );
};
