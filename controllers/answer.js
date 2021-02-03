const math = require("mathjs");
const { levelSystem } = require("../utils/level");
const { rankSystem } = require("../utils/level");
const { NUMBER_OF_PROBLEM } = require("../utils/challenge");
const { calculatePoints } = require("../utils/group");

const User = require("../models/User");
const Challenge = require("../models/Challenge");
const Group = require("../models/Group");
const Problem = require("../models/Problem");

const levelDictionary = levelSystem();
const rankDictionary = rankSystem();

const { SUBJECT, SSE_TOPIC } = require("../utils/const");
const { sendEventToGroupMember, sendEventToUser } = require("../middlewares");

const { CHECK_ANSWER_TYPE, DIFFICULTY } = require("../utils/const");
const { updateCoinAndExp } = require("./user");
const { SUBJECT, SSE_TOPIC } = require("../utils/const");
const { sendEventToGroupMember, sendEventToUser } = require("../middlewares");

const updateGroupScore = async (res, groupId, userId, correct, usedTime, correctAnswer) => {
  await Group.findById(groupId).exec().then((group) => {
    // User either took too long or answer incorrectly or hit skip
    if (usedTime >= +group.timePerProblem.toString() || !correct) {
    }
    else {
      group.members.find(member => member.userId.toString() === userId).score++;
      group.members.find(member => member.userId.toString() === userId).point += calculatePoints(usedTime, group.timePerProblem);
    }
    group.save();
    res.status(200).json({ success: true, data: {correct: correct, correctAnswer: correctAnswer} });
    sendEventToUser(group.creatorId, SSE_TOPIC.SEND_ANSWER);
    return;
  })
};

const updateChallengeScore = async (
  challengeId,
  correct,
  userTime,
  problemIndex,
  earnedExp,
  earnedCoins
) => {
  await Challenge.findById(challengeId)
    .exec()
    .then((challenge) => {
      if (challenge.whoTurn === 1) {
        challenge.user1Time =
          +challenge.user1Time.toString() + parseFloat(userTime);
        if (correct) {
          challenge.user1Result.set(problemIndex, 1);
          challenge.user1Score++;
          challenge.user1GainExp += earnedExp;
          challenge.user1GainCoin += earnedCoins;
        } else {
          challenge.user1Result.set(problemIndex, 0);
        }
      } else {
        challenge.user2Time =
          +challenge.user2Time.toString() + parseFloat(userTime);
        if (correct) {
          challenge.user2Result.set(problemIndex, 1);
          challenge.user2Score++;
          challenge.user2GainExp += earnedExp;
          challenge.user2GainCoin += earnedCoins;
        } else {
          challenge.user2Result.set(problemIndex, 0);
        }
      }

      // Update whoTurn when player finished NUMBER_OF_PROBLEM
      if (problemIndex === NUMBER_OF_PROBLEM - 1) {
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

  // * For Group Mode * //
  const groupId = req.body.groupId;
  const usedTime = req.body.usedTime; // Doesn't update difficulty index

  let earnedExp = 0;
  let earnedCoins = 0;

  Problem.findById(problemId)
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
        let correctFlag = false;
        switch (answer.checkAnswerType) {
          case CHECK_ANSWER_TYPE.EQUAL_STRING:
            if (userAnswer === answer.answerBody) {
              correctFlag = true;
            }
            if (answer.answerBody.includes("|")) {
              const correctAnswers = answer.answerBody.split("|");
              if (correctAnswers.includes(userAnswer)) {
                correctFlag = true;
              }
            }
            break;
          case CHECK_ANSWER_TYPE.MATH_EVALUATE: {
            const tempUserAnswer = userAnswer.split("[").join("(");
            const tempUserAnswer2 = tempUserAnswer.split("]").join(")");
            const tempAnswerBody = answer.answerBody.split("[").join("(");
            const tempAnswerBody2 = tempAnswerBody.split("]").join(")");
            if (
              math.evaluate(tempUserAnswer2) === math.evaluate(tempAnswerBody2)
            ) {
              correctFlag = true;
            }
          }
          case CHECK_ANSWER_TYPE.POWER_OVER_ONE: {
            // POWER equals 1
            if (userAnswer.includes("[1]")) {
              correctFlag = false;
            } else {
              const tempUserAnswer = userAnswer.split("[").join("(");
              const tempUserAnswer2 = tempUserAnswer.split("]").join(")");
              const tempAnswerBody = answer.answerBody.split("[").join("(");
              const tempAnswerBody2 = tempAnswerBody.split("]").join(")");
              if (
                math.evaluate(tempUserAnswer2) ===
                math.evaluate(tempAnswerBody2)
              ) {
                correctFlag = true;
              }
            }
          }
        }

        if (correctFlag) {
          User.findById(userId)
            .exec()
            .then((user) => {
              const updated = updateCoinAndExp(user, mode, answer.difficulty)
              user.save();

              // ? Update Challenge Field ? //
              if (mode === "challenge") {
                updateChallengeScore(
                  challengeId,
                  true,
                  userTime,
                  problemIndex,
                  updated.earnedExp,
                  updated.earnedCoins
                );
              }

              // * Update Group Field * //
              if (mode === "group") {
                return updateGroupScore(
                  res,
                  groupId,
                  userId,
                  true,
                  usedTime,
                  answer.body,
                )
              }

              const returnedSolution = {
                correct: true,
                solution: answer.solution,
                user: updated.user,
              };

              req.correct = returnedSolution.correct;
              req.solution = returnedSolution.solution;
              req.user = returnedSolution.user._id;
              req.level_up = updated.levelUp;
              req.rank_up = updated.rankUp;
              req.answer = answer.answerBody;
              req.earned_exp = updated.earnedExp;
              req.earned_coins = updated.earnedCoins;
              next();
            });
        } else {
          // ? Update Challenge Field ? //
          if (mode === "challenge") {
            updateChallengeScore(
              challengeId,
              false,
              userTime,
              problemIndex,
              earnedExp,
              earnedCoins
            );
          }

          // * Update Group Field * //
          if (mode === "group") {
            return updateGroupScore(
              res,
              groupId,
              userId,
              false,
              usedTime,
              answer.body,
            )
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
              req.answer = answer.answerBody;
              req.earned_exp = earnedExp;
              req.earned_coins = earnedCoins;
              next();
            });
        }
      }
    });
};
