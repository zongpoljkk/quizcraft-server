const Subtopic = require("../models/Subtopic");

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
  await Subtopic.findOneAndUpdate(
    {
      topic: req.query.topic,
      availableDifficulty: { $eq: [] },
    },
    {
      $addToSet: {
        availableDifficulty: {
          $each: [
            { isAvailable: false, difficulty: "EASY" },
            { isAvailable: false, difficulty: "MEDIUM" },
            { isAvailable: false, difficulty: "HARD" },
          ],
        },
      },
    },
    { new: true },
    (err, subtopics) => {
      if (err) {
        return res.status(500).json({ success: false, error: err });
      }
      if (!subtopics) {
        Subtopic.find(
          { topic: req.query.topic },
          { subtopicName: 1, availableDifficulty: 1 },
          (err, subtopics) => {
            if (err) {
              return res.status(500).json({ success: false, error: err });
            }
            if (!subtopics.length) {
              return res
                .status(400)
                .json({ success: false, data: "no subtopics" });
            }
            return res.status(200).json({ success: true, data: subtopics });
          }
        );
      } else {
        return res.status(200).json({ success: true, data: subtopics });
      }
    }
  );
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

