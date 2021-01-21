const Subtopic = require("../models/Subtopic");
const { DIFFICULTY } = require("../utils/const");

exports.addFile = (req, res) => {
  const subtopicName = req.body.subtopicName;
  const subjectImage = req.files.subjectImage;
  const topicImage = req.files.topicImage;
  Subtopic.findOne({ subtopicName: subtopicName })
    .select("_id photo")
    .exec((err, subtopic) => {
      if (err) {
        res
          .status(500)
          .send({ success: false, error: "Internal Server Error" });
      } else if (!subtopic) {
        res.status(400).send({
          success: false,
          error: "Unable to find subtopic with the given subtopicName",
        });
      }
      subtopic.subjectImg = subjectImage;
      subtopic.topicImg = topicImage;
      subtopic.save();
      res
        .status(200)
        .send({ success: true, data: "Upload subtopic media succeeded" });
    });
};

exports.getAllSubtopics = async (req, res) => {
  await Subtopic.find().exec((err, subtopics) => {
    if (err) {
      return res.status(500).json({ success: false, error: err });
    }
    if (!subtopics.length) {
      return res.status(400).json({ success: false, data: "no data" });
    }
    return res.status(200).json({ success: true, data: subtopics });
  });
};

exports.getAllSubjects = async (req, res) => {
  // TODO: Return subjects image
  // try {
  //   await Achievement.aggregate(
  //     [
  //       {
  //         $lookup: {
  //           from: "media.chunks",
  //           localField: "image.id",
  //           foreignField: "files_id",
  //           as: "image_info",
  //         },
  //       },
  //       { $unwind: "$image_info" },
  //       {
  //         $lookup: {
  //           from: "media.chunks",
  //           localField: "lottie.id",
  //           foreignField: "files_id",
  //           as: "lottie_info",
  //         },
  //       },
  //       { $unwind: "$lottie_info" },
  //       {
  //         $project: {
  //           _id: 1,
  //           name: 1,
  //           description: 1,
  //           "image_info.data": 1,
  //           "lottie_info.data": 1,
  //         },
  //       },
  //     ],
  //     (err, achievements) => {
  //       if (err) {
  //         return res.status(500).json({ success: false, error: err });
  //       }
  //       if (!achievements.length) {
  //         return res
  //           .status(400)
  //           .json({ success: false, data: "no achievements" });
  //       }
  //       return res.status(200).json({ success: true, data: achievements });
  //     }
  //   );
  // } catch (err) {
  //   console.log(err);
  // }
  await Subtopic.aggregate(
    [
      { $group: { _id: "$subject", subjectImg: { $first: "$subjectImg" } } },
      { $sort: { _id: 1 } },
    ],
    (err, subjects) => {
      if (err) {
        return res.status(500).json({ success: false, error: err });
      }
      if (!subjects.length) {
        return res.status(400).json({ success: false, data: "no subjects" });
      }
      return res.status(200).json({ success: true, data: subjects });
    }
  );
};

exports.getTopicBySubjectName = async (req, res) => {
  const subject = req.query.subject;
  try {
    await Subtopic.aggregate(
      [
        {
          $match: {
            subject: subject,
          },
        },
        {
          $group: {
            _id: "$topic",
            topicImg: { $first: "$topicImg" },
          },
        },
        // {
        //   $lookup: {
        //     from: "media.chunks",
        //     localField: "subjectImg.id",
        //     foreignField: "files_id",
        //     as: "subject_image_info",
        //   },
        // },
        // { $unwind: "$subject_image_info" },
        {
          $lookup: {
            from: "media.chunks",
            localField: "topicImg.id",
            foreignField: "files_id",
            as: "topic_image_info",
          },
        },
        { $unwind: "$topic_image_info" },
        {
          $project: {
            _id: 1,
            "topic_image_info.data": 1,
          },
        },
      ],
      (err, subtopics) => {
        console.log(subtopics);
        if (err) {
          console.log("ERROR")
          return res.status(500).json({ success: false, error: err });
        }
        if (!subtopics.length) {
          console.log("MAI MEE")
          return res.status(400).json({ success: false, data: "no subtopics" });
        }
        return res.status(200).json({ success: true, data: subtopics });
      }
    );
  } catch (err) {
    console.log(err);
  }
  console.log("FINALLY");
  // await Subtopic.aggregate(
  // [{
  //   $match: {
  //     subject: subject,
  //   },
  // },{
  //   $group: {
  //     _id: "$topic",
  //     topicImg: { $first: "$topicImg" }
  //   }
  // }],
  //   (err, topic) => {
  //     if (err) {
  //       return res.status(500).json({ success: false, error: err });
  //     }
  //     if (!topic.length) {
  //       return res.status(400).json({ success: false, data: "no topics" });
  //     }
  //     return res.status(200).json({ success: true, data: topic });
  //   })
};

exports.getSubtopicByTopicName = async (req, res) => {
  var availableDifficulty;
  var subtopic;
  try {
    const subtopics = await Subtopic.find(
      { topic: req.query.topic },
      { subtopicName: 1, availableDifficulty: 1 }
    );
    for (i in subtopics) {
      subtopic = subtopics[i];
      availableDifficulty = [
        {
          isAvailable: false,
          difficulty: DIFFICULTY.EASY,
        },
        {
          isAvailable: false,
          difficulty: DIFFICULTY.MEDIUM,
        },
        {
          isAvailable: false,
          difficulty: DIFFICULTY.HARD,
        },
      ];
      for (j in subtopic.availableDifficulty) {
        if (subtopic.availableDifficulty[j].difficulty == DIFFICULTY.EASY) {
          availableDifficulty[0].isAvailable =
            subtopic.availableDifficulty[j].isAvailable;
        } else if (
          subtopic.availableDifficulty[j].difficulty == DIFFICULTY.MEDIUM
        ) {
          availableDifficulty[1].isAvailable =
            subtopic.availableDifficulty[j].isAvailable;
        } else if (
          subtopic.availableDifficulty[j].difficulty == DIFFICULTY.HARD
        ) {
          availableDifficulty[2].isAvailable =
            subtopic.availableDifficulty[j].isAvailable;
        }
      }
      subtopics[i].availableDifficulty = availableDifficulty;
    }
    return res.status(200).json({ success: true, data: subtopics });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.toString() });
  }
};

exports.addSubtopic = (req, res, next) => {
  const subtopic = new Subtopic(req.body);
  subtopic.save((err, newSubtopic) => {
    if (err) res.send(err);
    else if (!newSubtopic) res.send(400);
    else res.send(newSubtopic);
    next();
  });
};

exports.updateAvailableDifficulty = async (req, res) => {
  const subtopicName = req.body.subtopicName;
  const difficulty = req.body.difficulty;
  const isAvailable = req.body.isAvailable;
  await Subtopic.findOne({
    subtopicName: subtopicName,
  }).exec((err, subtopic) => {
    if (err)
      return res.status(500).json({ success: false, error: err.toString() });
    else if (!subtopic)
      return res
        .status(400)
        .json({ success: false, error: "Subtopic not exist" });
    let have = false;
    for (i in subtopic.availableDifficulty) {
      if (subtopic.availableDifficulty[i].difficulty == difficulty) {
        have = true;
        subtopic.availableDifficulty[i].isAvailable = isAvailable;
        break;
      }
    }
    if (!have) {
      subtopic.availableDifficulty.push({
        difficulty: difficulty,
        isAvailable: isAvailable,
      });
    }
    subtopic.save((err, newSubtopic) => {
      if (err)
        return res.status(500).json({ success: false, error: err.toString() });
      else if (!newSubtopic)
        return res
          .status(400)
          .json({
            success: false,
            error: "Cannot update subtopic available difficulty",
          });
      return res.status(200).json({ success: true, newSubtopic });
    });
  });
};

exports.getAvailableDifficultyBySubtopicName = async (req, res) => {
  const subtopicName = req.query.subtopicName;
  const availableDifficulty = {
    EASY: false,
    MEDIUM: false,
    HARD: false,
  };
  try {
    const subtopic = await Subtopic.findOne(
      { subtopicName: subtopicName },
      { availableDifficulty: 1, _id: 0 }
    );
    if (!subtopic)
      return res
        .status(400)
        .json({ success: false, error: "Cannot find this subtopic" });
    for (i in subtopic.availableDifficulty) {
      if (subtopic.availableDifficulty[i].difficulty == DIFFICULTY.EASY) {
        availableDifficulty.EASY = subtopic.availableDifficulty[i].isAvailable;
      } else if (
        subtopic.availableDifficulty[i].difficulty == DIFFICULTY.MEDIUM
      ) {
        availableDifficulty.MEDIUM =
          subtopic.availableDifficulty[i].isAvailable;
      } else if (
        subtopic.availableDifficulty[i].difficulty == DIFFICULTY.HARD
      ) {
        availableDifficulty.HARD = subtopic.availableDifficulty[i].isAvailable;
      }
    }
    return res.status(200).json({ success: true, data: availableDifficulty });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.toString() });
  }
};
