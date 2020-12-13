const Problem = require("../models/Problem");
const Subtopic = require("../models/Subtopic");
const Answer = require("../models/Answer");
const Hint = require("../models/Hint");
const { mathGenerate } = require("./mathProblem/mathProblemGenerator");
const MATH = "คณิตศาสตร์";
const ENG = "ภาษาอังกฤษ";

exports.getAllProblems = (req, res, next) => {
  Problem.find().exec((err, problems) => {
    if (err) return res.status(500).json({ success: false, error: err });
    else if (!problems)
      return res.status(400).json({ success: false, data: "no data" });
    else return res.status(200).json({ success: true, data: problems });
  });
};

// For testing
exports.addProblem = (req, res, next) => {
  const problem = new Problem(req.body);
  problem.save((err, newProblem) => {
    if (err) return res.status(500).json({ success: false, error: err });
    else if (!newProblem)
      return res.status(400).json({ success: false, data: "no data" });
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
    if (err) res.send(err);
    else if (!problem) res.send(400);
    else res.send(problem);
    next();
  });
};

exports.putDifficultyIndex = async (req, res, next) => {
  const problemId = req.query.problemId;
  const userTime = req.query.userTime;
  const correct = req.correct;
  const solution = req.solution;
  const user = req.user;
  const level_up = req.level_up;

  Problem.findById(problemId).exec(async (err, problem) => {
    if (err) res.status(500).send("Internal Server Error");
    else if (!problem)
      res
        .status(400)
        .send(`Unable to find problem given problem id ${problemId}`);
    else {
      next();
    }

    problem.times = [...problem.times, userTime];
    if (!problem.users.includes(user)) {
      problem.users = [...problem.users, user];
    }
    // });
    // update problem times and user Array
    const sumUserTime = problem.toJSON().times.reduce((sum, time) => {
      return sum + +time.toString();
    }, 0);
    const avgUserTime = sumUserTime / problem.toJSON().times.length;

    // TODO: filter outliers
    // Copy the values, rather than operating on references to existing values
    let copyTimes = [];
    for (let time of problem.toJSON().times) {
      copyTimes.push(+time.toString());
    }

    // Then sort
    const sortedCopyTimes = copyTimes.sort((a, b) => {
      return a - b;
    });

    const q1 = sortedCopyTimes[Math.floor(sortedCopyTimes.length / 4)];
    // Likewise for q3.
    const q3 = sortedCopyTimes[Math.ceil(sortedCopyTimes.length * (3 / 4))];
    const iqr = q3 - q1;

    // Then find min and max values
    const maxValue = q3 + iqr * 1.5;
    const minValue = q1 - iqr * 1.5;

    // Then filter anything beyond or beneath these values.
    const filteredValues = sortedCopyTimes.filter((time) => {
      return time <= maxValue && time >= minValue;
    });

    sumProblemTime = filteredValues.reduce((sum, time) => {
      return sum + time;
    });

    avgProblemTime = sumProblemTime / filteredValues.length;

    // Time limit for a problem to be in the specific difficulty level
    const EASY_CEIL = 13;
    const MEDIUM_CEIL = 150;

    const current_difficulty = problem.difficulty;

    // Dealing with returned earned coin
    let earned_coins = 0;

    switch (problem.difficulty) {
      case "EASY":
        earned_coins = 10;
        earned_exp = 10;
        if (avgProblemTime >= EASY_CEIL) {
          if (avgProblemTime >= MEDIUM_CEIL) {
            problem.difficulty = "HARD";
          } else {
            problem.difficulty = "MEDIUM";
          }
        }
        break;
      case "MEDIUM":
        earned_coins = 20;
        earned_exp = 20;
        if (avgProblemTime >= MEDIUM_CEIL) {
          problem.difficulty = "HARD";
        } else if (avgProblemTime < EASY_CEIL) {
          problem.difficulty = "EASY";
        }
      case "HARD":
        earned_coins = 30;
        earned_exp = 30;
        if (avgProblemTime < MEDIUM_CEIL) {
          if (avgProblemTime < EASY_CEIL) {
            problem.difficulty = "EASY";
          } else {
            problem.difficulty = "MEDIUM";
          }
        }
    }
    problem.save();
    const new_difficulty = problem.difficulty;

    res.send({
      old_difficulty: current_difficulty,
      new_difficulty: new_difficulty,
      correct: correct,
      solution: solution,
      user: user,
      earned_coins: earned_coins,
      earned_exp: earned_exp,
      level_up: level_up,
    });
    // });
    next();
  });
};

// for testing
exports.generateProblem = async (req, res, next) => {
  try {
    const [{ problem, answer, hint }] = await mathGenerate(req.body);
    return res.send({ problem, answer, hint });
  } catch (err) {
    return res.status(500).json({ success: false, error: err });
  }
};

exports.getProblemForUser = async (req, res, next) => {
  const userId = req.body.userId;
  const subject = req.body.subject;
  const subtopicName = req.body.subtopicName;
  const difficulty = req.body.difficulty;
  var answer;
  var problem = await Problem.findOneAndUpdate(
    {
      subtopicName: subtopicName,
      difficulty: difficulty,
      users: { $ne: userId },
    },
    { $push: { users: userId } },
    { projection: { users: 0, times: 0, subtopicName: 0, difficulty: 0 } }
  );
  if (problem == null) {
    //generate problem
    switch (subject) {
      case MATH:
        try {
          await mathGenerate({ subtopicName, difficulty });
          problem = await Problem.findOneAndUpdate(
            {
              subtopicName: subtopicName,
              difficulty: difficulty,
              users: { $ne: userId },
            },
            { $push: { users: userId } },
            {
              projection: {
                users: 0,
                times: 0,
                subtopicName: 0,
                difficulty: 0,
              },
            }
          );
          answer = await Answer.findOne({ problemId: problem._id });
          return res.status(200).json({
            success: true,
            data: { problem, correctAnswer: answer.body },
          });
        } catch (err) {
          return res.status(400).json({ success: false, error: err });
        }
      case ENG:
        //TODO: Generate problem
        return res
          .status(404)
          .json({ success: false, error: "Problem out of stock" });
      default:
        return res
          .status(404)
          .json({ success: false, error: "Problem out of stock" });
    }
  } else {
    answer = await Answer.findOne({ problemId: problem._id });
    return res
      .status(200)
      .json({ success: true, data: { problem, correctAnswer: answer.body } });
  }
};

// For testing: Mock database
exports.addProblemAnswerHint = async (req, res, next) => {
  const problem = req.body.problem;
  const answerBody = req.body.answer.body;
  const solution = req.body.answer.solution;
  const hintBody = req.body.hint.body;

  const newProblem = new Problem(problem);
  const newAnswer = new Answer({
    problemId: newProblem._id,
    body: answerBody,
    solution,
  });
  const newHint = new Hint({ problemId: newProblem._id, body: hintBody });
  try {
    await newProblem.save();
    await newAnswer.save();
    await newHint.save();
    return res.status(200).json({
      success: true,
      data: { problem: newProblem, answer: newAnswer, hint: newHint },
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err });
  }
};
