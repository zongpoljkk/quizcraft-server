const Problem = require("../models/Problem");
const Answer = require("../models/Answer");
const Hint = require("../models/Hint");
const { mathGenerate } = require("./mathProblem/mathProblemGenerator");
const { englishGenerate } = require("./englishProblem/englishProblemGenerator");
const { ANSWER_TYPE, SUBJECT, DIFFICULTY } = require("../utils/const");
const { ObjectId } = require("mongodb");

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
    } else {
      avgProblemTime = -1;
    }

    // Time limit for a problem to be in the specific difficulty level
    const EASY_CEIL = 30;
    const MEDIUM_CEIL = 60;

    const old_difficulty = problem.difficulty;

    switch (problem.difficulty) {
      case DIFFICULTY.EASY:
        if (avgProblemTime >= EASY_CEIL) {
          if (avgProblemTime >= MEDIUM_CEIL) {
            problem.difficulty = DIFFICULTY.HARD;
          } else {
            problem.difficulty = DIFFICULTY.MEDIUM;
          }
        }
        break;
      case DIFFICULTY.MEDIUM:
        if (avgProblemTime >= MEDIUM_CEIL) {
          problem.difficulty = DIFFICULTY.HARD;
        } else if (avgProblemTime < EASY_CEIL) {
          problem.difficulty = DIFFICULTY.EASY;
        }
        break;
      case DIFFICULTY.HARD:
        if (avgProblemTime < MEDIUM_CEIL) {
          if (avgProblemTime < EASY_CEIL) {
            problem.difficulty = DIFFICULTY.EASY;
          } else {
            problem.difficulty = DIFFICULTY.MEDIUM;
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
  let subject = req.body.subject;
  let problem;
  switch (subject) {
    case SUBJECT.MATH: 
      try {
        problem = await mathGenerate(req.body);
        return res.send({ problem });
      } catch (err) {
        return res.status(500).json({ success: false, error: err.toString() });
      }
    
    case SUBJECT.ENG:
      try {
        problem = await englishGenerate(req.body);
        return res.send({ problem });
      } catch (err) {
        return res.status(500).json({ success: false, error: err.toString() });
      }
     default: return res.send("Default");
  }
};

exports.getProblemForUser = async (req, res, next) => {
  const userId = req.body.userId;
  const subject = req.body.subject;
  const subtopicName = req.body.subtopicName;
  const difficulty = req.body.difficulty;
  var problemOut;
  try {
    var problem = await Problem.findOneAndUpdate(
      {
        subtopicName: subtopicName,
        difficulty: difficulty,
        users: { $ne: userId },
      },
      { $push: { users: userId } },
    );
    if (problem == null) {
      //generate problem
      switch (subject) {
        case SUBJECT.MATH:
          await mathGenerate({ subtopicName, difficulty });
          break;
        case SUBJECT.ENG:
          await englishGenerate({ subtopicName, difficulty });
          break;
        default:
          return res.status(404).json({ success: false, error: "Problem out of stock" });
      }
      //find problem again
      problem = await Problem.findOneAndUpdate(
        {
          subtopicName: subtopicName,
          difficulty: difficulty,
          users: { $ne: userId },
        },
        { $push: { users: userId } },
      );
    }

    let haveHint = false;
    if (problem.hintBody) {
      haveHint = true;
    }
  
    problemOut = {
      _id: problem._id,
      choices: problem.choices,
      body: problem.body,
      answerType: problem.answerType,
      title: problem.title,
      haveHint: haveHint,
    } 
    if (problem.answerType == ANSWER_TYPE.MATH_INPUT) {
      return res.status(200).json({ 
        success: true, 
        data: { 
          problem: problemOut, 
          correctAnswer: problem.answerForDisplay 
        } 
      });
    } else {
      return res.status(200).json({ 
        success: true, 
        data: { problem: problemOut } 
      });
    }
  } catch (err) {
    if (!problem) return res.status(404).json({ success: false, error: "Problem out of stock and cannot generate problem" });
    else if (err) return res.status(500).json({ success: false, error: err.toString() });
    else return res.status(400).json({ success: false, error: "Something went wrong" });
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

exports.getProblemAnswerHint = async (req, res) => {
  const problemId = req.query.problemId;
  try {
    const problem = await Problem.findById(problemId);
    const answer = await Answer.findOne({ problemId: problemId });
    const hint = await Hint.findOne({ problemId: problemId });
    return res.status(200).json({ success: true, data: { problem, answer, hint } });
  } catch {
    return res.status(500).json({ success: false, error: err.toString() });
  }
}

exports.getProblems = async (subject, subtopicName, difficulty, numberOfProblem, userIdList) => {
  let problem;
  let problems = [];
  let problemBodyList = [];

  do {
    problem = await Problem.aggregate([
      {
        $match: {
          subtopicName: subtopicName,
          difficulty: difficulty,
          users: { $nin: userIdList },
        },
      },
      { 
        $sample: { size: 1 }
      },
    ]);

    problem = problem[0];
    
    if (problem == null) {
      //generate problem
      switch (subject) {
        case SUBJECT.MATH:
          await mathGenerate({ subtopicName, difficulty });
          break;
        case SUBJECT.ENG:
          await englishGenerate({ subtopicName, difficulty });
          break;
      }
    } else {
      problem = await Problem.findOneAndUpdate({ _id: problem._id }, { $addToSet: {users: userIdList} }, { new:true } );
    }

    if (problem && !problemBodyList.includes(problem.body)) {
      problems.push(problem._id);
      problemBodyList.push(problem.body);
    }
  } while (problems.length < numberOfProblem);

  return problems;
}
