const math = require("mathjs");
const { levelSystem } = require("../utils/level");
const { rankSystem } = require("../utils/level");
const { NUMBER_OF_PROBLEM } = require("../utils/challenge");

const Answer = require("../models/Answer");
const User = require("../models/User");
const Challenge = require("../models/Challenge");

const levelDictionary = levelSystem();
const rankDictionary = rankSystem();

const updateChallengeScore = async (
  challengeId,
  correct,
  userTime,
  problemIndex
) => {
  await Challenge.findById(challengeId)
    .exec()
    .then((challenge) => {
      if (challenge.whoTurn === 1) {
        challenge.user1Time =
          +challenge.user1Time.toString() + parseFloat(userTime);
        if (correct) {
          console.log("IF");
          console.log(`problemIndex: ${problemIndex}`);
          challenge.user1Result.set(problemIndex, 1);
          challenge.user1Score++;
        } else {
          console.log("ELSE");
          console.log(`problemIndex: ${problemIndex}`);
          challenge.user1Result.set(problemIndex, 0);
        }
      } else {
        challenge.user2Time =
          +challenge.user2Time.toString() + parseFloat(userTime);
        if (correct) {
          challenge.user2Result.set(problemIndex, 1);
          challenge.user2Score++;
        } else {
          challenge.user2Result.set(problemIndex, 0);
        }
      }

      // Update whoTurn when player finished NUMBER_OF_PROBLEM
      if (problemIndex === NUMBER_OF_PROBLEM - 1) {
        console.log(`probleMIndex: ${problemIndex}`)
        switch (challenge.whoTurn) {
          case 1:
            challenge.whoTurn = 2;
            break;
          case 2:
            challenge.whoTurn = 1;
        }
        challenge.currentProblem = 0;
        challenge.user1IsRead = false;
        challenge.user2IsRead = false;
      }

      console.log(challenge);
      // No need to update current index because already did when getting problem by challenge id
      challenge.save();
    });
};

exports.checkAnswer = async (req, res, next) => {
  let problemId = req.body.problemId;
  const userId = req.body.userId;
  const userAnswer = req.body.userAnswer;
  const subtopic = req.body.subtopic;
  const mode = req.body.mode;

  // ? For Challenge Mode ? //
  const challengeId = req.body.challengeId;
  const problemIndex = req.body.problemIndex;
  const userTime = req.body.userTime;

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
        console.log(`error finding answer given problem id`);
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

              // * Update Challenge Field * //
              if (mode === "challenge") {
                updateChallengeScore(challengeId, true, userTime, problemIndex);
              }

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
          // * Update Challenge Field * //
          if (mode === "challenge") {
            updateChallengeScore(challengeId, false, userTime, problemIndex);
          }

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
