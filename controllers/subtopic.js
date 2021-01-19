const Subtopic = require("../models/Subtopic");
const { DIFFICULTY } = require("../utils/const");

exports.getAllSubtopics = async (req, res) => {
  await Subtopic.find()
    .exec((err, subtopics) => {
      if (err) {
        return res.status(500).json({ success: false, error: err });
      }
      if (!subtopics.length) {
        return res.status(400).json({ success: false, data: "no data" });
      }
      return res.status(200).json({ success: true, data: subtopics });
    })
};

exports.getAllSubjects = async (req, res) => {
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
  await Subtopic.aggregate(
    [{
      $match: {
        subject: subject,
      },
    },{
      $group: { 
        _id: "$topic", 
        topicImg: { $first: "$topicImg" } 
      } 
    }],
    (err, topic) => {
      if (err) {
        return res.status(500).json({ success: false, error: err });
      }
      if (!topic.length) {
        return res.status(400).json({ success: false, data: "no topics" });
      }
      return res.status(200).json({ success: true, data: topic });
    })
};

exports.getSubtopicByTopicName = async (req, res) => {
  var availableDifficulty;
  var subtopic;
  try {
    const subtopics = await Subtopic.find({ topic: req.query.topic }, { subtopicName: 1, availableDifficulty:1 });
    for (i in subtopics) {
      subtopic = subtopics[i];
      availableDifficulty = [
        {
          isAvailable: false,
          difficulty: DIFFICULTY.EASY
        },
        {
          isAvailable: false,
          difficulty: DIFFICULTY.MEDIUM
        },
        {
          isAvailable: false,
          difficulty: DIFFICULTY.HARD
        }
      ]
      for (j in subtopic.availableDifficulty) {
        if (subtopic.availableDifficulty[j].difficulty == DIFFICULTY.EASY) {
          availableDifficulty[0].isAvailable = subtopic.availableDifficulty[j].isAvailable;
        } 
        else if (subtopic.availableDifficulty[j].difficulty == DIFFICULTY.MEDIUM) {
          availableDifficulty[1].isAvailable = subtopic.availableDifficulty[j].isAvailable;
        } 
        else if (subtopic.availableDifficulty[j].difficulty == DIFFICULTY.HARD) {
          availableDifficulty[2].isAvailable = subtopic.availableDifficulty[j].isAvailable;
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
    if (err) return res.status(500).json({ success: false, error: err.toString() });
    else if (!subtopic) return res.status(400).json({ success: false, error: "Subtopic not exist" });
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
      })
    }
    subtopic.save((err, newSubtopic) => {
      if (err) return res.status(500).json({ success: false, error: err.toString() });
      else if (!newSubtopic) return res.status(400).json({ success: false, error: "Cannot update subtopic available difficulty" });
      return res.status(200).json({ success: true, newSubtopic });
    })
  })
}

exports.getAvailableDifficultyBySubtopicName = async (req,res) => {
  const subtopicName = req.query.subtopicName;
  const availableDifficulty = {
    EASY: false, 
    MEDIUM: false, 
    HARD: false
  }
  try {
    const subtopic = await Subtopic.findOne({ subtopicName: subtopicName }, {availableDifficulty: 1, _id: 0});
    if (!subtopic) return res.status(400).json({ success: false, error: "Cannot find this subtopic" });
    for (i in subtopic.availableDifficulty) {
      if (subtopic.availableDifficulty[i].difficulty == DIFFICULTY.EASY) {
        availableDifficulty.EASY = subtopic.availableDifficulty[i].isAvailable;
      } 
      else if (subtopic.availableDifficulty[i].difficulty == DIFFICULTY.MEDIUM) {
        availableDifficulty.MEDIUM = subtopic.availableDifficulty[i].isAvailable;
      } 
      else if (subtopic.availableDifficulty[i].difficulty == DIFFICULTY.HARD) {
        availableDifficulty.HARD = subtopic.availableDifficulty[i].isAvailable;
      }
    }
    return res.status(200).json({ success: true, data: availableDifficulty});
  } catch (err) {
    return res.status(500).json({ success: false, error: err.toString() });
  }
}

