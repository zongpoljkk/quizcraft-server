const math = require("mathjs");
const { use } = require("passport");

const Answer = require("../models/Answer");
const User = require("../models/User");

exports.getAnswer = async (req, res, next) => {
  const problemId = req.query.problemId;
  const userId = req.query.userId;
  const userAnswer = req.query.userAnswer;
  const subtopic = req.query.subtopic;
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
              // * Handle Earned coins * //
              switch (answer.problemId.difficulty) {
                case "EASY":
                  user.exp += 10;
                  user.coin += 10;
                  break;
                case "MEDIUM":
                  user.exp += 20;
                  user.coin += 20;
                  break;
                case "HARD":
                  user.exp += 30;
                  user.coin += 30;
                  break;
              }

              // * Handle Level up * //
              const levels = 40;
              const exp_for_first_level = 100;
              const exp_for_last_level = 100000;

              const B =
                Math.log(exp_for_last_level / exp_for_first_level) /
                (levels - 1);
              const A = exp_for_first_level / (Math.exp(B) - 1.0);

              const levelDictionary = new Object();

              for (const i of Array(levels).keys()) {
                const old_xp = Math.round(A * Math.exp(B * i));
                const new_xp = Math.round(A * Math.exp(B * (i + 1)));
                levelDictionary[i + 1] = new_xp - old_xp;
              }

              // Compare user exp if it exceeds the limit of his/her level
              let level_up;
              if (user.exp >= levelDictionary[parseInt(user.level)]) {
                if (user.level == 40) {
                } else {
                  level_up = true;
                  user.exp -= levelDictionary[parseInt(user.level)];
                  user.level += 1;
                }
              } else {
                level_up = false;
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
              req.level_up = level_up;
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
              req.level_up = level_up;
              next();
            });
        }
      }
    });
};
