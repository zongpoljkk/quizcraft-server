const Subtopic = require('../models/Subtopic');

exports.getAllSubtopics = async (req,res) => {
    await Subtopic.find().exec((err, subtopics) => {
        if (err) {
            return res.status(500).json({ success: false, error: err })
        }
        if (!subtopics.length) {
            return res
                .status(400)
                .json({ success: false, data: "no data" })
        }
        return res.status(200).json({ success: true, data: subtopics })
    }).catch(err => console.log(err))
  }

exports.getAllSubjects = async (req,res) => {
  await Subtopic.distinct("subject", (err, subjects) => {
      if (err) {
          return res.status(500).json({ success: false, error: err })
      }
      if (!subjects.length) {
          return res
              .status(400)
              .json({ success: false, data: "no subjects" })
      }
      return res.status(200).json({ success: true, data: subjects })
  }).catch(err => console.log(err))
}

exports.getTopicBySubjectName = async (req,res) => {
  const subject = Subtopic.find({ subject: req.query.subject });
  await subject.distinct( "topic", (err, topic) => {
      if (err) {
          return res.status(500).json({ success: false, error: err })
      }
      if (!topic.length) {
          return res
              .status(400)
              .json({ success: false, data: "no topics" })
      }
      return res.status(200).json({ success: true, data: topic })
  }).catch(err => console.log(err))
};

exports.getSubtopicByTopicName = async (req,res) => {
    await Subtopic.find({ topic: req.query.topic }, {subtopicName: 1}, (err, subtopics) => {
        if (err) {
            return res.status(500).json({ success: false, error: err })
        }
        if (!subtopics.length) {
            return res
                .status(400)
                .json({ success: false, data: "no subtopics" })
        }
        return res.status(200).json({ success: true, data: subtopics })
    }).catch(err => console.log(err))
}

exports.addSubtopic = (req, res, next) => {
  const subtopic = new Subtopic(req.body);
  subtopic.save((err, newSubtopic) => {
          if(err) res.send(err);
          else if (!newSubtopic) res.send(400);
          else res.send(newSubtopic);
          next();
  })
}