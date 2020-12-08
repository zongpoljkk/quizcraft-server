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

exports.getProblemOutliers = (req, res, next) => {
  const subtopicName = req.query.subtopicName;
  const difficulty = req.query.difficulty;
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
    // TODO: If possible, getting avg by using $group is probably better than by using reduce function
    // {
    //   $group: {
    //     _id: "_id",
    //     AverageTime: { $avg: +("$avgTime").toString() },
    //   },
    // },
  ]).exec((err, problems) => {
    if (err) res.send(err);
    else if (!problems) res.send(400);
    else {
      const sumUserTime = problems.reduce((sum, problem) => {
        // console.log(problem)
        // const sumPerProblem = problem.times.reduce((sum, time) => {
        //   return sum + +time.toString();
        // }, 0);
        // avgPerProblem = sumPerProblem / problem.times.length;
        return sum + avgPerProblem;
      }, 0);
      const avgUserTime = sumUserTime / problems.length;
      //   console.log(problems);
      console.log(avgUserTime);

      // TODO: filter outliers
      // Copy the values, rather than operating on references to existing values
      let copyProblems = [];
      for (let problem in problems) {
        console.log(+problems[problem].avgTime.toString());
        copyProblems.push([
          problems[problem]._id,
          +problems[problem].avgTime.toString(),
        ]);
      }

      // Then sort
      const sortedCopyProblems = copyProblems.sort((a, b) => {
        return a[1] - b[1];
      });

      console.log(`sortedCopyProblems.length: ${sortedCopyProblems.length}`);

      /* Then find a generous IQR. This is generous because if (values.length / 4)
       * is not an int, then really you should average the two elements on either
       * side to find q1.
       */
      console.log(Math.floor(3 / 4));
      console.log(0.75 * 3);
      // TODO: Check if sortedCopyProblems length >= 4
      const q1 =
        sortedCopyProblems[Math.floor(sortedCopyProblems.length / 4)][1];
      // Likewise for q3.
      const q3 =
        sortedCopyProblems[Math.ceil(sortedCopyProblems.length * (3 / 4))][1];
      const iqr = q3 - q1;

      console.log(`q3: ${q3}`);
      console.log(`q1: ${q1}`);
      console.log(`iqr: ${iqr}`);
      // Then find min and max values
      const maxValue = q3 + iqr * 1.5;
      console.log(`maxValue: ${maxValue}`);
      const minValue = q1 - iqr * 1.5;

      // Then filter anything beyond or beneath these values.
      const filteredValues = sortedCopyProblems.filter((problem) => {
        return problem[1] > maxValue;
      });

      console.log(`sortedCopyProblems: ${sortedCopyProblems}`);
      console.log(filteredValues);

      res.send({ outliers: filteredValues });
    }
    next();
  });
};

exports.putDifficultyIndex = (req, res, next) => {
  const problemId = req.query.problemId;
  Problem.findById(problemId)
    // .select("_id, times, difficulty")
    .exec((err, problem) => {
      if (err) res.status(500).send("Internal Server Error");
      else if (!problem)
        res
          .status(400)
          .send(`Unable to find problem given problem id ${problemId}`);
      else {
        next();
      }
      console.log(problem.toJSON());
      // console.log(problem.toJSON().users)
      // console.log(problem.toJSON().times)
      const sumUserTime = problem.toJSON().times.reduce((sum, time) => {
        return sum + +time.toString();
      }, 0);
      const avgUserTime = sumUserTime / problem.toJSON().times.length;
      console.log(avgUserTime);

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

      console.log(sortedCopyTimes);

      const q1 = sortedCopyTimes[Math.floor(sortedCopyTimes.length / 4)];
      // Likewise for q3.
      const q3 = sortedCopyTimes[Math.ceil(sortedCopyTimes.length * (3 / 4))];
      const iqr = q3 - q1;

      console.log(`q3: ${q3}`);
      console.log(`q1: ${q1}`);
      console.log(`iqr: ${iqr}`);

      // Then find min and max values
      const maxValue = q3 + iqr * 1.5;
      const minValue = q1 - iqr * 1.5;

      console.log(`maxValue: ${maxValue}`);
      console.log(`minValue: ${minValue}`);

      // Then filter anything beyond or beneath these values.
      const filteredValues = sortedCopyTimes.filter((time) => {
        return time <= maxValue && time >= minValue;
      });

      console.log(filteredValues);

      sumProblemTime = filteredValues.reduce((sum, time) => {
        return sum + time;
      });

      avgProblemTime = sumProblemTime / filteredValues.length;

      console.log(`avgProblemTime: ${avgProblemTime}`);

      // Time limit for a problem to be in the specific difficulty level
      const EASY_CEIL = 13;
      const MEDIUM_CEIL = 150;

      // if (problem.difficulty === "EASY") {
      //   if (avgProblemTime > EASY_CEIL) {

      //     res.send({ over: true });
      //     return;
      //   }
      // }

      const current_difficulty = problem.difficulty;

      switch (problem.difficulty) {
        case "EASY":
          if (avgProblemTime > EASY_CEIL) {
            if (avgProblemTime > MEDIUM_CEIL) {
              problem.difficulty = "HARD";
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
          return res.status(200).json({ success: true, data: problem });
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
