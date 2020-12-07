const Problem = require("../models/Problem");
const Subtopic = require("../models/Subtopic");
const Answer = require("../models/Answer");
const Hint = require("../models/Hint");
const { mathGenerate } = require("./mathProblemGenerator");
const MATH = "คณิตศาสตร์";
const ENG = "ภาษาอังกฤษ";

exports.getAllProblems = (req, res, next) => {
  Problem.find().exec((err, problems) => {
    if (err) return res.status(500).json({ success: false, error: err });
    else if (!problems) return res.status(400).json({ success: false, data: "no data" });
    else return res.status(200).json({ success: true, data: problems });
  });
};

// For testing
exports.addProblem = (req, res, next) => {
  const problem = new Problem(req.body);
  problem.save((err, newProblem) => {
    if (err) return res.status(500).json({ success: false, error: err });
    else if (!newProblem) return res.status(400).json({ success: false, data: "no data" });
    else return res.status(200).json({ success: true, data: newProblem });
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
    if (err) return res.status(500).json({ success: false, error: err });
    else if (!problem) return res.status(400).json({ success: false, data: "no data" });
    else return res.status(200).json({ success: true, data: problem });
  });
};

// for testing
exports.generateProblem = async (req, res, next) => {
  try{
    const [{ problem, answer, hint }] = await mathGenerate(req.body);
    return res.send({ problem, answer, hint});
  } catch (err) {
    return res.status(500).json({ success: false, error: err });
  }
};

exports.getProblemForUser = async (req, res, next) => {
  const userId = req.body.userId;
  const subject = req.body.subject;
  const subtopicName = req.body.subtopicName;
  const difficulty = req.body.difficulty;
  var problem = await Problem.findOneAndUpdate({subtopicName:subtopicName, difficulty:difficulty,users:{$ne:userId}}, 
                                                { $push: { users: userId } }, {projection:{users:0,times:0,subtopicName:0,difficulty:0}});
	if (problem == null) { //generate problem
		switch (subject) {
			case MATH:
				try{
					await mathGenerate({subtopicName,difficulty});
					problem = await Problem.findOneAndUpdate({subtopicName:subtopicName, difficulty:difficulty,users:{$ne:userId}}, 
						{ $push: { users: userId } }, {projection:{users:0, times:0, subtopicName:0, difficulty:0}});
					return res.status(200).json({ success: true, data: problem });
				} catch (err) {
					return res.status(400).json({ success: false, error: err });
				}
			case ENG: 
				//TODO: Generate problem
				return res.status(404).json({ success: false, error: "Problem out of stock" });
			default:
				return res.status(404).json({ success: false, error: "Problem out of stock" });
		}
	}else{
		return res.status(200).json({ success: true, data: problem });
	}
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
    return res.status(200).json({ success: true, data: {problem:newProblem,answer:newAnswer,hint:newHint} })
  }catch (err) {
    return res.status(500).json({ success: false, error: err });
  }
};
