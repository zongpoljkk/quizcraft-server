const Problem = require("../models/Problem");
const Subtopic = require("../models/Subtopic");
const Answer = require("../models/Answer");
const Hint = require("../models/Hint");
const { mathGenerate } = require("./mathProblem/mathProblemGenerator");
const { englishGenerate } = require("./englishProblem/englishProblemGenerator");
const MATH = "คณิตศาสตร์";
const ENG = "ภาษาอังกฤษ";

exports.getAllProblems = (req, res, next) => {
  Problem.find().exec((err, problems) => {
    if (err) return res.status(500).json({ success: false, error: err });
    else if (!problems)
      return res.status(400).json({ success: false, error: "no data" });
    else return res.status(200).json({ success: true, data: problems });
  });
};

// For testing
exports.addProblem = (req, res, next) => {
  const problem = new Problem(req.body);
  problem.save((err, newProblem) => {
    if (err) return res.status(500).json({ success: false, error: err });
    else if (!newProblem)
      return res.status(400).json({ success: false, error: "no data" });
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
    else if (!problem)
      return res.status(400).json({ success: false, error: "no data" });
    else return res.status(200).json({ success: true, data: problem });
  });
};

exports.checkAnswerAndUpdateDifficulty = async (req, res, next) => {
  const problemId = req.body.problemId;
  const userTime = req.body.userTime;
  const correct = req.correct;
  const answer = req.answer;
  const solution = req.solution;
  const user = req.user;
  const level_up = req.level_up;
  const rank_up = req.rank_up;
  const earned_exp = req.earned_exp;
  const earned_coins = req.earned_coins;

  Problem.findById(problemId).exec(async (err, problem) => {
    if (err)
      res.status(500).send({ success: false, error: "Internal Server Error" });
    else if (!problem)
      res.status(400).send({
        success: false,
        error: `Unable to find problem given problem id ${problemId}`,
      });

    problem.times = [...problem.times, userTime];
    if (!problem.users.includes(user)) {
      problem.users = [...problem.users, user];
    }

    // update problem times and user Array
    // const sumUserTime = problem.toJSON().times.reduce((sum, time) => {
    //   return sum + +time.toString();
    // }, 0);
    // const avgUserTime = sumUserTime / problem.toJSON().times.length;

    // TODO: filter outliers
    if (problem.times.length > 10) {
      // Copy the values, rather than operating on references to existing values
      let copyTimes = [];
      for (let time of problem.toJSON().times) {
        copyTimes.push(+time.toString());
      }

      // Then sort
      const sortedCopyTimes = copyTimes.sort((a, b) => {
        return a - b;
      });

      console.log(`sortedCopyTimes: ${sortedCopyTimes}`);

      const q1 = sortedCopyTimes[Math.floor(sortedCopyTimes.length / 4)];
      // Likewise for q3.
      const q3 = sortedCopyTimes[Math.ceil(sortedCopyTimes.length * (3 / 4))];
      const iqr = q3 - q1;

      console.log(`q1: ${q1}`);
      console.log(`q3: ${q3}`);

      // Then find min and max values
      const maxValue = q3 + iqr * 1.5;
      const minValue = q1 - iqr * 1.5;

      // Then filter anything beyond or beneath these values.
      const filteredValues = sortedCopyTimes.filter((time) => {
        console.log(maxValue);
        console.log(minValue);
        console.log(time);
        return time <= maxValue && time >= minValue;
      });

      sumProblemTime = filteredValues.reduce((sum, time) => {
        return sum + time;
      });

      avgProblemTime = sumProblemTime / filteredValues.length;
    } else {
      avgProblemTime = -1;
    }

    // Time limit for a problem to be in the specific difficulty level
    const EASY_CEIL = 13;
    const MEDIUM_CEIL = 150;

    const old_difficulty = problem.difficulty;

    switch (problem.difficulty) {
      case "EASY":
        if (avgProblemTime >= EASY_CEIL) {
          if (avgProblemTime >= MEDIUM_CEIL) {
            problem.difficulty = "HARD";
          } else {
            problem.difficulty = "MEDIUM";
          }
        }
        break;
      case "MEDIUM":
        if (avgProblemTime >= MEDIUM_CEIL) {
          problem.difficulty = "HARD";
        } else if (avgProblemTime < EASY_CEIL) {
          problem.difficulty = "EASY";
        }
        break;
      case "HARD":
        if (avgProblemTime < MEDIUM_CEIL) {
          if (avgProblemTime < EASY_CEIL) {
            problem.difficulty = "EASY";
          } else {
            problem.difficulty = "MEDIUM";
          }
        }
    }
    if (avgProblemTime === -1) {
      problem.difficulty = old_difficulty;
    }
    problem.save();

    res.send({
      correct: correct,
      solution: solution,
      user: user,
      answer: answer,
      earned_coins: earned_coins,
      earned_exp: earned_exp,
      level_up: level_up,
      rank_up: rank_up,
    });
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
        try {
          await englishGenerate({ subtopicName, difficulty });
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
          return res.status(200).json({
            success: true,
            data: { problem },
          });
        } catch (err) {
          return res.status(400).json({ success: false, error: err });
        }

      default:
        return res
          .status(404)
          .json({ success: false, error: "Problem out of stock" });
    }
  } else {
    if (subject == MATH) {
      answer = await Answer.findOne({ problemId: problem._id });
      return res
        .status(200)
        .json({ success: true, data: { problem, correctAnswer: answer.body } });
    } else {
      return res.status(200).json({ success: true, data: { problem } });
    }
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
