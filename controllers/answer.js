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
  let earnedExp = 0;
  let earnedCoins = 0;

  // ------ Handle mode surplus ------ //
  let mode_surplus = 1;
  switch (mode) {
    case "challenge":
      mode_surplus = 1.2;
      break;
    case "quiz":
      mode_surplus = 1.4;
      break;
    case "group":
      mode_surplus = 0;
      break;
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
          userAnswer === answer.body
          // TODO: Evaluate Math expression for subtopic "การดำเนินการของเลขยกกำลัง"
          // (subtopic === "การดำเนินการของเลขยกกำลัง" && // For this topic, there are many possible answers
          //   math.evaluate(userAnswer) === math.evaluate(answer.body))
          // math.compare(userAnswer, answer.body) === true)
        ) {
        //  || subtopic === "การดำเนินการของเลขยกกำลัง") {

          // try {
          //    const eval = math.evaluate(userAnswer) === math.evaluate(answer.body)
          // }
          // catch (err) {
          //   console.log(`Can't evaluate string: ${err}`)
          // }


          User.findById(userId)
            .exec()
            .then((user) => {
              // * Handle Earned coins * //
              switch (answer.problemId.difficulty) {
                case "EASY":
                  earnedExp = 10 * mode_surplus;
                  earnedCoins = 10 * mode_surplus;
                  user.exp += earnedExp;
                  user.coin += earnedCoins;
                  break;
                case "MEDIUM":
                  earnedExp = 20 * mode_surplus;
                  earnedCoins = 20 * mode_surplus;
                  user.exp += earnedExp;
                  user.coin += earnedCoins;
                  break;
                case "HARD":
                  earnedExp = 30 * mode_surplus;
                  earnedCoins = 30 * mode_surplus;
                  user.exp += earnedExp;
                  user.coin += earnedCoins;
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
              req.earned_exp = earnedExp;
              req.earned_coins = earnedCoins;
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
              req.earned_exp = earnedExp;
              req.earned_coins = earnedCoins;
              next();
            });
        }
      }
    });
};
