const math = require("mathjs");
const { levelSystem } = require("../utils/level");
const { rankSystem } = require("../utils/level");

const Answer = require("../models/Answer");
const User = require("../models/User");

const levelDictionary = levelSystem();
const rankDictionary = rankSystem();

exports.checkAnswer = async (req, res, next) => {
  const problemId = req.body.problemId;
  const userId = req.body.userId;
  const userAnswer = req.body.userAnswer;
  const subtopic = req.body.subtopic;
  const mode = req.body.mode;

  // ------ Handle mode surplus ------ //
  let mode_surplus = 1;
  switch (mode) {
    case "challenge":
      mode_surplus = 1.2;
    case "quiz":
      mode_surplus = 1.4;
    case "group":
      mode_surplus = 0;
  }

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
          (subtopic === "การดำเนินการของเลขยกกำลัง" && // For this topic, there are many possible answers
            math.evaluate(userAnswer) === math.evaluate(answer.body))
        ) {
          const user = User.findById(userId)
            .exec()
            .then((user) => {
              // * Handle Earned coins * //
              switch (answer.problemId.difficulty) {
                case "EASY":
                  user.exp += 10 * mode_surplus;
                  user.coin += 10 * mode_surplus;
                  break;
                case "MEDIUM":
                  user.exp += 20 * mode_surplus;
                  user.coin += 20 * mode_surplus;
                  break;
                case "HARD":
                  user.exp += 30 * mode_surplus;
                  user.coin += 30 * mode_surplus;
                  break;
              }

              // * Handle Level up * //
              // Compare user exp if it exceeds the limit of his/her level
              let level_up;
              let rank_up;
              if (user.exp >= levelDictionary[parseInt(user.level)]) {
                if (user.level == 40) {
                } else {
                  level_up = true;
                  user.exp -= levelDictionary[parseInt(user.level)];
                  user.maxExp = levelDictionary[parseInt(user.level + 1)];
                  user.level += 1;
                  // ? Handle Rank up ? //
                  if (user.level in rankDictionary) {
                    user.rank = rankDictionary[user.level];
                    rank_up = true;
                  }
                }
              } else {
                level_up = false;
                rank_up = false;
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
              req.rank_up = rank_up;
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
              req.level_up = false;
              req.rank_up = false;
              req.answer = answer.body;
              next();
            });
        }
      }
    });
};
