const mongoose = require("mongoose");

const Achievement = require("../models/Achievement");
const User = require("../models/User");
const Report = require("../models/Report");
const Problem = require("../models/Problem");

const NUMBER_OF_ITEMS = 5;

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
            return res.status(200).json({ success: true, data: [] });
          }
          return res.status(200).json({ success: true, data: achievements });
        }
      );
    })
    .catch((err) => {
      console.log(err);
    });
};

// Add achievement to user if not already exists
function add(arr, name) {
  const new_achivement = new Achievement();
  const id = mongoose.Types.ObjectId();
  const found = arr.some((el) => el.achievementName === name);
  if (!found)
    arr.push({ _id: mongoose.Schema.Types.ObjectId, achievementName: name });
}

exports.checkAchievement = async (req, res) => {
  // console.log(req.body);
  let user_achievement_names = [];
  const type = req.body.type;
  const userId = req.body.userId;

  if (type === "questions") {
    // TODO: Handle Question related, Do on answer page or on result page
    // นักแก้โจทย์
    const subtopic = req.body.subtopic;
    //   Person.find({
    // members: {
    //    $elemMatch: { id: id1 }
    // }
    //  });
    await Problem.find({
      // "users.id": mongoose.Types.ObjectId(userId),
      users: userId,
    })
      .exec()
      .then((problems) => {
        console.log("GOT IN QUESTION TYPE");
        console.log(problems.length);
        const filtered = problems.filter(
          (problem) => problem.subtopicName === subtopic
        );
        console.log(filtered.length);
        if (filtered.length >= 10) {
          console.log("DID MORE THAN 10 PROBLEMS");
          user_achievement_names = [
            ...user_achievement_names,
            `นักแก้โจทย์${subtopic}มือสมัครเล่น`,
          ];
        }
        if (filtered.length >= 50) {
          user_achievement_names = [
            ...user_achievement_names,
            `นักแก้โจทย์${subtopic}ธรรมดา`,
          ];
        }
        if (filtered.length >= 100) {
          user_achievement_names = [
            ...user_achievement_names,
            `นักแก้โจทย์${subtopic}ปรมาจารย์`,
          ];
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

  if (type === "streak") {
    // Handle Streaks, Do when get to homepage
    const streaks = +req.body.streaks;

    if (streaks >= 7) {
      // console.log("SHOULD KAOO");
      user_achievement_names = [...user_achievement_names, "จับฉันให้ได้สิ"];
    }
    if (streaks >= 14) {
      user_achievement_names = [...user_achievement_names, "จับฉันไม่ได้หรอก"];
    }
    if (streaks >= 28) {
      user_achievement_names = [
        ...user_achievement_names,
        "ให้ตายก็ไม่มีทางจับฉันได้",
      ];
    }
  }

  // Handle Report related, Do when finish a game, like QUIZ type
  if (type === "report") {
    try {
      await Report.find({ userId: userId })
        .exec()
        .then((reports) => {
          if (reports.length >= 3) {
            user_achievement_names = [
              ...user_achievement_names,
              "ตาวิเศษเห็นนะ",
            ];
          }
        });
    } catch (err) {
      console.log(err);
    }
  }

  // Handle Item related, Do when useEffect Shop page {
  // Check if user has more than 10 basic items and more than 3 advance items
  if (type === "item") {
    console.log("KAO TYPE ITEM");
    const items = req.body.items;
    let check = 0;
    for (const [key, value] of Object.entries(items)) {
      console.log(`${key}: ${value}`);
      if (["hint", "skip", "refresh"].includes(key)) {
        if (value >= 10) {
          check++;
        }
      } else {
        if (value >= 3) {
          check++;
        }
      }
    }
    console.log(check);
    if (check === NUMBER_OF_ITEMS) {
      user_achievement_names = [...user_achievement_names, "นักสะสมไอเทม"];
    }
  }

  // * UPDATE User's achievement * //
  await User.findById(userId)
    .exec()
    .then((user) => {
      // Pick achievement that user just got to the FE to show modal (user haven't already got it)
      user_achievement_names.forEach((new_achievement_name) => {
        if (
          user.achievements.some((ach) => {
            return ach.achievementName === new_achievement_name;
          })
        ) {
          user_achievement_names = user_achievement_names.filter(
            (new_achievement) => new_achievement !== new_achievement_name
          );
        }
      });

      // Update User achievements field
      user_achievement_names.forEach((new_achievement_name) => {
        user.achievements = [
          ...user.achievements,
          {
            _id: mongoose.Types.ObjectId,
            achievementName: new_achievement_name,
          },
        ];
      });
      user.save();
    })
    .catch((error) => {
      console.log(error);
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
      return res.status(200).json({ success: true, data: achievements });
    }
  );
};
