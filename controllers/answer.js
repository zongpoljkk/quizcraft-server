const math = require("mathjs");

const Answer = require("../models/Answer");
const User = require("../models/User");

exports.checkAnswer = async (req, res, next) => {
  const problemId = req.body.problemId;
  const userId = req.body.userId;
  const userAnswer = req.body.userAnswer;
  const subtopic = req.body.subtopic;
  Answer.findOne({ problemId: problemId })
    .populate("problemId", "difficulty")
    .exec((err, answer) => {
      if (err) {
        console.log(`errrrror`);
        res.status(500).send({ error: err });
      } else if (!answer) {
        res
          .status(400)
          .send("The answer with the given problem id was not found");
        return;
      } else {
        if (
          userAnswer === answer.body ||
          (subtopic === "การดำเนินการของเลขยกกำลัง" &&
            math.evaluate(userAnswer) === math.evaluate(answer.body))
        ) {
          const user = User.findById(userId)
            .exec()
            .then((user) => {
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
              const returnedSolution = {
                correct: true,
                solution: answer.solution,
                user: user,
              };
              req.correct = returnedSolution.correct;
              req.solution = returnedSolution.solution;
              req.user = returnedSolution.user._id;
              req.answer = answer.body;
              next();
            });
        } else {
          const user = User.findById(userId)
            .exec()
            .then((user) => {
              const returnedSolution = {
                correct: false,
                solution: answer.solution,
                user: user,
              };
              req.correct = returnedSolution.correct;
              req.solution = returnedSolution.solution;
              req.user = returnedSolution.user._id;
              req.answer = answer.body;
              next();
            });
        }
      }
    });
};
