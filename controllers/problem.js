const Problem = require("../models/Problem");
const Subtopic = require("../models/Subtopic");
const Answer = require("../models/Answer");
const Hint = require("../models/Hint");
const { mathGenerate } = require("./mathProblemGenerator");

exports.getAllProblems = (req, res, next) => {
  Problem.find().exec((err, problems) => {
    if (err) res.send(err);
    else if (!problems) res.send(400);
    else res.send(problems);
    next();
  });
};

// For testing
exports.addProblem = (req, res, next) => {
  const problem = new Problem(req.body);
  problem.save((err, newProblem) => {
    if (err) res.send(err);
    else if (!newProblem) res.send(400);
    else res.send(newProblem);
    next();
  });
};

exports.getProblems = (req, res, next) => {
  const subtopicName = req.body.subtopicName;
  const difficulty = req.body.difficulty;
  Problem.aggregate([
    {
      $lookup: {
        from: "subtopics",
        localField: "subtopicName",
        foreignField: "subtopicName",
        as: "subtopic",
      },
    },
    {
      $match: {
        difficulty: difficulty,
        subtopicName: subtopicName,
      },
    },
  ]).exec((err, problem) => {
    if (err) return res.status(400).json({ success: false, error: err });
    else if (!problem) return res.status(404);
    else return res.status(200).json({ success: true, data: problem });
    next();
  });
};

// for testing
exports.generateProblem = async (req, res, next) => {
    try{
        const { problem, answer, hint } = await mathGenerate(req.body);
        return res.send({ problem, answer, hint});
      } catch (err) {
        return res.status(400).json({ success: false, error: err });
      }
};

exports.getProblemForUser = async (req, res, next) => {
  const userId = req.body.userId;
  const subject = req.body.subject;
  const subtopicName = req.body.subtopicName;
  const difficulty = req.body.difficulty;
  const problem = Problem.findOne();
  //have to send
  res.send("TODO");
};

// For testing: Mock database
exports.addProblemAnswerHint = async (req, res, next) => {
  const problem = req.body.problem;
  const answerBody = req.body.answer.body;
  const solution = req.body.answer.solution;
  const hintBody = req.body.hint.body;

  const newProblem = new Problem(problem);
  const newAnswer = new Answer({problemId:newProblem._id,body:answerBody,solution});
  const newHint = new Hint({problemId:newProblem._id, body:hintBody});
  try {
    await newProblem.save();
    await newAnswer.save();
    await newHint.save();
    return res
      .status(200)
      .json({
        success: true,
        data: { problem: newProblem, answer: newAnswer, hint: newHint },
      });
  } catch (err) {
    return res.status(400).json({ success: false, error: err });
  }
};
