const math = require("mathjs");
const { levelSystem } = require("../utils/level");
const { rankSystem } = require("../utils/level");
const { NUMBER_OF_PROBLEM } = require("../utils/challenge");

const Answer = require("../models/Answer");
const User = require("../models/User");
const Challenge = require("../models/Challenge");

const levelDictionary = levelSystem();
const rankDictionary = rankSystem();

// TODO: Handle checkChallengeAnswer
const getChallengeProblemId = (challengeId) => {
  let challengeProblemId = "";

  Challenge.findById(challengeId)
    .exec()
    .then((challenge) => {
      challengeProblemId = challenge.problems[currentProblem];
    });

  return challengeProblemId;
};

const updateChallengeScore = (challengeId, correct, userTime) => {
  Challenge.findById(challengeId)
    .exec()
    .then((challenge) => {
      if (challenge.whoturn === 1) {
        challenge.user1Time += userTime;
        if (correct) {
          challenge.user1Result[challenge.currentProblem] = 1;
          challenge.user1Score++;
        } else {
          challenge.user1Result[challenge.currentProblem] = 0;
        }
      } else {
        challenge.user2Time += userTime;
        if (correct) {
          challenge.user2Result[challenge.currentProblem] = 1;
          challenge.user2Score++;
        } else {
          challenge.user2Result[challenge.currentProblem] = 0;
        }
      }

      // Update current_problem index
      challenge.currentProblem++;

      // Update whoTurn when player finished NUMBER_OR_PROBLEM
      if (challenge.currentProblem === NUMBER_OF_PROBLEM - 1) {
        switch (challenge.whoturn) {
          case 1:
            challenge.whoturn = 2;
            break;
          case 2:
            challenge.whoturn = 1;
        }
      }
      challenge.save();
    });
};

exports.checkAnswer = async (req, res, next) => {
  let problemId = req.body.problemId;
  const userId = req.body.userId;
  const userAnswer = req.body.userAnswer;
  const subtopic = req.body.subtopic;
  const mode = req.body.mode;
  const challengeId = req.body.challengeId;
  const userTime = req.body.userTime;
  let earned_exp = 0;
  let earned_coins = 0;

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

  if (mode === "challenge") {
    problemId = getChallengeProblemId(challengeId);
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
          User.findById(userId)
            .exec()
            .then((user) => {
              // * Handle Earned coins * //
              switch (answer.problemId.difficulty) {
                case "EASY":
                  earned_exp = 10 * mode_surplus;
                  earned_coins = 10 * mode_surplus;
                  user.exp += earned_exp;
                  user.coin += earned_coins;
                  break;
                case "MEDIUM":
                  earned_exp = 20 * mode_surplus;
                  earned_coins = 20 * mode_surplus;
                  user.exp += earned_exp;
                  user.coin += earned_coins;
                  break;
                case "HARD":
                  earned_exp = 30 * mode_surplus;
                  earned_coins = 30 * mode_surplus;
                  user.exp += earned_exp;
                  user.coin += earned_coins;
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
                updateChallengeScore(challengeId, true, userTime);
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
              req.earned_exp = earned_exp;
              req.earned_coins = earned_coins;
              next();
            });
        } else {
          // * Update Challenge Field * //
          if (mode === "challenge") {
            updateChallengeScore(challengeId, true, userTime);
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
              req.earned_exp = earned_exp;
              req.earned_coins = earned_coins;
              next();
            });
        }
      }
    });
};
