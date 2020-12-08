const math = require("mathjs");

const Answer = require("../models/Answer");
const User = require("../models/User");
// const Problem = require("../models/Problem");

// const validateComputation = (expression1, expression2) => {
//   gen1 = expression1.toString().replace(/[^0-9,+,*]+/g, "");
//   gen2 = expression2.toString().replace(/[^0-9,+,*]+/g, "");
//   if (gen1 === gen2) {
//     return true;
//   } else {
//     return false;
//   }
// };

exports.getAnswer = (req, res, next) => {
  // answer.save();
  console.log(math.evaluate("2^4"));
  console.log("Got in to getAnswer");
  const problemId = req.query.problemId;
  const userId = req.query.userId;
  const userAnswer = req.query.userAnswer;
  const topic = req.query.topic;
  console.log(`problemId: ${problemId}`);
  Answer.findOne({ problemId: problemId })
    .populate("problemId", "difficulty")
    .exec((err, answer) => {
      console.log(`answer: ${answer}`);
      if (err) {
        console.log(`errrrror`);
        res.status(500).send({ error: err });
      } else if (!answer) {
        res
          .status(400)
          .send("The answer with the given problem id was not found");
        return;
      } else {
        console.log("Not Error");
        // console.log(math.evaluate())
        if (
          userAnswer === answer.body ||
          (topic === "การดำเนินการของเลขยกกำลัง" &&
            math.evaluate(userAnswer) === math.evaluate(answer.body))
        ) {
          console.log("Torb took");
          const user = User.findById(userId)
            .exec()
            .then((user) => {
              console.log(`user ${user}`);
              console.log(
                `answer.problem.difficulty: ${answer.problemId.difficulty}`
              );
              switch (answer.problemId.difficulty) {
                case "EASY":
                  user.coin += 10;
                  break;
                case "MEDIUM":
                  user.coin += 20;
                  break;
                case "HARD":
                  user.coin += 30;
                  break;
              }
              user.save();
            });

          // res.send({ correct: true, solution: answer.solution });
          // res.send({});
          return { correct: true, solution: answer.solution };
        } else {
          // res.send({ correct: false, solution: answer.solution });
          // res.send({});
          return { correct: false, solution: answer.solution };
        }
      }

      next();
    });

  // res.json(answer);
};

exports.postAnswer = (req, res, next) => {
  console.log("KAOO");
  //   console.log(req);5fca7457d873ae72d4f59696
  console.log(req.body);
  console.log(req.body.problemId);
  console.log(req.body.body);
  const problemId = req.body.problemId;
  const body = req.body.body;
  const answer = new Answer({ problemId: problemId, body: body });
  answer
    .save()
    .then((result) => {
      console.log("save answer");
      res.json(result);
    })
    .catch((err) => {
      console.log(err);
    });
  next();
};
