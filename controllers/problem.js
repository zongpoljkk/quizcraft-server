const { max } = require("mathjs");
const Problem = require("../models/Problem");
const Subtopic = require("../models/Subtopic");

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
        return sum + +problem.avgTime.toString();
      }, 0);
      const avgUserTime = sumUserTime / problems.length;
      //   console.log(problems);
      console.log(avgUserTime);

      // TODO: filter outliers
      // Copy the values, rather than operating on references to existing values
      let copyProblems = [];
      for (let problem in problems) {
        console.log(+problems[problem].avgTime.toString());
        copyProblems.push([problems[problem]._id, +problems[problem].avgTime.toString()]);
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
      console.log(Math.floor(3/4))
      console.log(0.75*3)
      // TODO: Check if sortedCopyProblems length >= 4
      const q1 = (sortedCopyProblems[Math.floor(sortedCopyProblems.length / 4)])[1];
      // Likewise for q3.
      const q3 = (sortedCopyProblems[Math.ceil(sortedCopyProblems.length * (3 / 4))])[1];
      const iqr = q3 - q1;


      console.log(`q3: ${q3}`)
      console.log(`q1: ${q1}`)
      console.log(`iqr: ${iqr}`)
      // Then find min and max values
      const maxValue = q3 + iqr * 1.5;
      console.log(`maxValue: ${maxValue}`)
      const minValue = q1 - iqr * 1.5;

      // Then filter anything beyond or beneath these values.
      const filteredValues = sortedCopyProblems.filter( (problem) => {
        return problem[1] > maxValue;
      });

      console.log(`sortedCopyProblems: ${sortedCopyProblems}`)
      console.log(filteredValues)

      res.send({outliers: filteredValues});
    }
    next();
  });
};

// const ceilTime = avgUserTime * 1.5;
// //   const problemId = req.body.problemId;
// //   console.log(problemId);
// problems.forEach((problem) => {
//   Problem.findById(problem._id)
//     .select("id avgTime difficulty")
//     .exec((err, problem) => {
//       console.log(problem);
//       if (!problem) {
//         res
//           .status(400)
//           .send("The problem with the given id was not found");
//         return;
//       } else {
//         console.log("huay");
//         if (problem.avgTime > ceilTime) {
//           problem.difficulty = "HARD";
//           problem.save();
//         }
//         //   res.send(problem);
//       }
//     });
// });
