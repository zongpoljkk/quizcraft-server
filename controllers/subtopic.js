const Subtopic = require("../models/Subtopic");

// For testing
exports.getAllSubtopics = (req, res, next) => {
  Subtopic.find().exec((err, subtopics) => {
    if (err) res.send(err);
    else if (!subtopics) res.send(400);
    else res.send(subtopics);
    next();
  });
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

exports.getSubtopic = (req, res, next) => {
  res.send("Not Implement: getSubtopic");
  //     const subtopicName = req.params.subtopicName;
};
