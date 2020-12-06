const Subtopic = require('../models/Subtopic');

exports.getAllSubtopics = (req, res, next) => {
    Subtopic.find().exec((err, subtopics) => {
        if(err) res.send(err);
        else if (!subtopics) res.send(400);
        else res.send(subtopics);
        next();
    });
}

exports.getAllSubjects = async (req,res) => {
  await Subtopic.distinct("subject", (err, subjects) => {
      if (err) {
          return res.status(400).json({ success: false, error: err })
      }
      if (!subjects) {
          return res
              .status(404)
              .json({ success: true, data: "no subjects" })
      }
      return res.status(200).json({ success: true, data: subjects })
  }).catch(err => console.log(err))
}

exports.getTopicBySubjectName = async (req,res) => {
  const subject = Subtopic.find({ subject: req.query.subject });
  await subject.distinct( "topic", (err, topic) => {
      if (err) {
          return res.status(400).json({ success: false, error: err })
      }
      if (!topic) {
          return res
              .status(404)
              .json({ success: true, data: "no topic" })
      }
      return res.status(200).json({ success: true, data: topic })
  }).catch(err => console.log(err))
};

exports.getSubtopicByTopicName = async (req,res) => {
    await Subtopic.find({ topic: req.query.topic }, {subtopicName: 1}, (err, subtopics) => {
        if (err) {
            return res.status(400).json({ success: false, error: err })
        }
        if (!subtopics) {
            return res
                .status(404)
                .json({ success: true, data: "no subtopics" })
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