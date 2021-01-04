const User = require("../models/User");
const Challenge = require("../models/Challenge");
const Problem = require("../models/Problem");
const Answer = require("../models/Answer");
const { NUMBER_OF_PROBLEM } = require("../utils/challenge");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const { mathGenerate } = require("./mathProblem/mathProblemGenerator");
const { englishGenerate } = require("./englishProblem/englishProblemGenerator");
const MATH = "คณิตศาสตร์";
const ENG = "ภาษาอังกฤษ";

const randInt = (start, end) => {
  return Math.floor(Math.random() * (end - start + 1)) + start;
};

exports.randomChallenge = async (req, res) => {
  const user1Id = req.body.user1Id;
  const subject = req.body.subject;
  const subtopicName = req.body.subtopicName;
  const difficulty = req.body.difficulty;
  var problem,
    problems = [];
  try {
    //step1: random user2 that user2 != user1
    const user1 = await User.findOne(
      { _id: user1Id },
      { _id: 1, firstname: 1, lastname: 1, username: 1, photo: 1 }
    );
    let count = await User.countDocuments({ _id: { $ne: user1Id } });
    let random = randInt(0, count - 1);
    const randomUser = await User.findOne(
      { _id: { $ne: user1Id } },
      { _id: 1, firstname: 1, lastname: 1, username: 1, photo: 1 }
    ).skip(random);
    const user2Id = randomUser._id;

    //step2: get <NUMBER_OF_PROBLEM> question for both user (both user should never seen all questions before)
    for (i = 0; i < NUMBER_OF_PROBLEM; i++) {
      problem = await Problem.findOneAndUpdate(
        {
          subtopicName: subtopicName,
          difficulty: difficulty,
          users: { $nin: [user1Id, user2Id] },
        },
        { $addToSet: { users: [user1Id, user2Id] } },
        { projection: { _id: 1 } }
      );
      if (problem == null) {
        //generate problem
        switch (subject) {
          case MATH:
            await mathGenerate({ subtopicName, difficulty });
            break;
          case ENG:
            await englishGenerate({ subtopicName, difficulty });
            break;
        }
        problem = await Problem.findOneAndUpdate(
          {
            subtopicName: subtopicName,
            difficulty: difficulty,
            users: { $nin: [user1Id, user2Id] },
          },
          { $addToSet: { users: [user1Id, user2Id] } },
          { projection: { _id: 1 } }
        );
      }
      problems.push(problem._id);
    }

    //step3: create challenge
    const challenge = new Challenge({
      user1Id: user1Id,
      user2Id: user2Id,
      problems: problems,
      subtopicName: subtopicName,
      difficulty: difficulty,
    });

    //save to database
    await challenge.save();
    return res.status(200).json({
      success: true,
      data: { challengeId: challenge._id, user1, user2: randomUser },
    });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.toString() });
  }
};

exports.specificChallenge = async (req, res) => {
  const user1Id = req.body.user1Id;
  const username = req.body.username;
  const subject = req.body.subject;
  const subtopicName = req.body.subtopicName;
  const difficulty = req.body.difficulty;
  var problem,
    problems = [];
  try {
    //step1: check if username is exist and not same as user1
    const user1 = await User.findOne(
      { _id: user1Id },
      { _id: 1, firstname: 1, lastname: 1, username: 1, photo: 1 }
    );
    const user2 = await User.findOne(
      { username: username },
      { _id: 1, firstname: 1, lastname: 1, username: 1, photo: 1 }
    );
    if (!user2)
      return res
        .status(400)
        .json({ success: false, error: "Cannot find the user" });
    if (user2._id == user1Id)
      return res
        .status(400)
        .json({ success: false, error: "Cannot challenge yourself" });
    const user2Id = user2._id;

    //step2: get <NUMBER_OF_PROBLEM> question for both user (both user should never seen all questions before)
    for (i = 0; i < NUMBER_OF_PROBLEM; i++) {
      problem = await Problem.findOneAndUpdate(
        {
          subtopicName: subtopicName,
          difficulty: difficulty,
          users: { $nin: [user1Id, user2Id] },
        },
        { $addToSet: { users: [user1Id, user2Id] } },
        { projection: { _id: 1 } }
      );
      if (problem == null) {
        //generate problem
        switch (subject) {
          case MATH:
            await mathGenerate({ subtopicName, difficulty });
            break;
          case ENG:
            await englishGenerate({ subtopicName, difficulty });
            break;
        }
        problem = await Problem.findOneAndUpdate(
          {
            subtopicName: subtopicName,
            difficulty: difficulty,
            users: { $nin: [user1Id, user2Id] },
          },
          { $addToSet: { users: [user1Id, user2Id] } },
          { projection: { _id: 1 } }
        );
      }
      problems.push(problem._id);
    }

    //step3: create challenge
    const challenge = new Challenge({
      user1Id: user1Id,
      user2Id: user2Id,
      problems: problems,
      subtopicName: subtopicName,
      difficulty: difficulty,
    });

    // save to database
    await challenge.save();
    return res.status(200).json({
      success: true,
      data: { challengeId: challenge._id, user1, user2 },
    });
  } catch (err) {
    return res.status(400).json({ success: false, error: err });
  }
};

exports.getProblemByChallengeId = (req, res) => {
  const challengeId = req.query.challenge_id;
  const problemIndex = req.query.problem_index;

  try {
    Challenge.findById(challengeId)
      .exec()
      .then(async (challenge) => {
        if (!challenge) {
          return res.status(400).json({
            success: false,
            error: `Unable to find challenge given challenge id ${challengeId}`,
          });
        }
        // ? Handle user lost connection by skip user's current problem and mark as incorrect  ? //
        if (challenge.currentProblem != NUMBER_OF_PROBLEM - 1) {
          challenge.currentProblem++;
        }
        if (challenge.whoTurn === 1) {
          challenge.user1Result.push(0);
        } else {
          challenge.user2Result.push(0);
        }
        challenge.save();

        Problem.findById(challenge.problems[problemIndex])
          .select("choices _id body answerType title")
          .exec()
          .then(async (problem) => {
            if (!problem) {
              return res.status(400).json({
                success: false,
                error: `Unable to find problem given index ${problemIndex}`,
              });
            }
            if (problem.answerType === "MATH_INPUT") {
              const answer = await Answer.findOne({ problemId: problem._id });
              return res.status(200).json({
                success: true,
                data: { problem: problem, correct_answer: answer.body },
              });
            }
            return res.status(200).json({ success: true, data: problem });
          });
      });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.toString() });
  }
};

exports.getChallengeInfo = async (req, res) => {
  const userId = req.query.userId;
  const challengeId = req.query.challengeId;
  try {
    var challenge = await Challenge.aggregate([
      {
        $match: {
          _id: mongoose.Types.ObjectId(challengeId),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user1Id",
          foreignField: "_id",
          as: "fromUser1",
        },
      },
      { $unwind: "$fromUser1" },
      {
        $lookup: {
          from: "users",
          localField: "user2Id",
          foreignField: "_id",
          as: "fromUser2",
        },
      },
      { $unwind: "$fromUser2" },
      {
        $addFields: {
          user1Photo: "$fromUser1.photo",
          user2Photo: "$fromUser2.photo",
          user1Username: "$fromUser1.username",
          user2Username: "$fromUser2.username",
          user1IsPlayed: false,
          user2IsPlayed: false,
        },
      },
      { $set: { user1IsPlayed: { $gt: [{ $size: "$user1Result" }, 0] } } },
      { $set: { user2IsPlayed: { $gt: [{ $size: "$user2Result" }, 0] } } },
    ]);

      challenge = challenge[0];
      var out;
      if (challenge.user1Id == userId) {
        out = {
          me: {
            photo: challenge.user1Photo,
            username: challenge.user1Username,
            score: challenge.user1Score,
            usedTime: parseFloat(challenge.user1Time),
            currentProblem: challenge.currentProblem,
            isPlayed: challenge.user1IsPlayed
          },
          opponent: {
            photo: challenge.user2Photo,
            username: challenge.user2Username,
            score: challenge.user2Score,
            usedTime: parseFloat(challenge.user2Time),
            currentProblem: challenge.currentProblem,
            isPlayed: challenge.user2IsPlayed
          }
        }
      } else {
        out = {
          me: {
            photo: challenge.user2Photo,
            username: challenge.user2Username,
            score: challenge.user2Score,
            usedTime: parseFloat(challenge.user2Time),
            currentProblem: challenge.currentProblem,
            isPlayed: challenge.user2IsPlayed
          },
          opponent: {
            photo: challenge.user1Photo,
            username: challenge.user1Username,
            score: challenge.user1Score,
            usedTime: parseFloat(challenge.user1Time),
            currentProblem: challenge.currentProblem,
            isPlayed: challenge.user1IsPlayed
          }
        }
      }
      return res.status(200).json({ success: true, data: out });
    } catch (err) {
      if (!challenge) return res.status(400).json({ success:false, error: "Cannot find the challenge" });
      else if (err) return res.status(500).json({ success:false, error: err.toString() });
      else return res.status(400).json({ succes:false, error: "Something went wrong"});
    }
    return res.status(200).json({ success: true, data: out });
  } catch (err) {
    if (!challenge)
      return res
        .status(400)
        .json({ success: false, error: "Cannot find the challenge" });
    else if (err)
      return res.status(500).json({ success: false, error: err.toString() });
    else
      return res
        .status(400)
        .json({ succes: false, error: "Something went wrong" });
  }
};

exports.readChallenge = async (req, res) => {
  const challengeId = req.body.challengeId;
  const userId = req.body.userId;
  await Challenge.findOne({
    _id: challengeId,
    $or: [{ user1Id: userId }, { user2Id: userId }],
  }).exec((err, challenge) => {
    if (err) return res.status(500).json({ success: false, error: err });
    else if (!challenge)
      return res
        .status(400)
        .json({ success: false, error: "Challenge not exist" });
    if (challenge.user1Id == userId) challenge.user1IsRead = true;
    else challenge.user2IsRead = true;
    challenge.save((err, newChallenge) => {
      if (err) return res.status(500).json({ success: false, error: err });
      else if (!challenge)
        return res
          .status(400)
          .json({ success: false, error: "Challenge not exist" });
      if (challenge.user1Id == userId) challenge.user1IsRead = true;
      else challenge.user2IsRead = true;
      challenge.save((err, newChallenge) => {
        if (err) return res.status(500).json({ success: false, error: err });
        else if (!newChallenge)
          return res
            .status(400)
            .json({ success: false, error: "Cannot update challenge" });
        return res.status(200).json({
          success: true,
          isRead:
            newChallenge.user1Id == userId
              ? newChallenge.user1IsRead
              : newChallenge.user2IsRead,
        });
      });
    });
  });
};

exports.getAllMyChallenges = async (req, res) => {
  const userId = req.query.userId;
  const subtopicName = req.query.subtopicName;
  const difficulty = req.query.difficulty;
  try {
    const challenges = await Challenge.aggregate([
      {
        $match: {
          subtopicName: subtopicName,
          difficulty: difficulty,
          $or: [{ user1Id: ObjectId(userId) }, { user2Id: ObjectId(userId) }],
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user1Id",
          foreignField: "_id",
          as: "user1",
        },
      },
      { $unwind: "$user1" },
      {
        $lookup: {
          from: "users",
          localField: "user2Id",
          foreignField: "_id",
          as: "user2",
        },
      },
      { $unwind: "$user2" },
      {
        $project: {
          _id: 1,
          whoTurn: 1,
          user1Score: 1,
          user2Score: 1,
          user1Id: 1,
          user2Id: 1,
          user1Result: 1,
          user2Result: 1,
          user1IsRead: 1,
          user2IsRead: 1,
          user1: {
            photo: 1,
            firstname: 1,
            lastname: 1,
            username: 1,
          },
          user2: {
            photo: 1,
            firstname: 1,
            lastname: 1,
            username: 1,
          },
        },
      },
    ]);

    var myTurn = [];
    var theirTurn = [];
    var result = [];
    var temp;
    for (challenge of challenges) {
      if (challenge.user1Id == userId) {
        temp = {
          challengeId: challenge._id,
          userId: challenge.user2Id,
          firstname: challenge.user2.firstname,
          lastname: challenge.user2.lastname,
          username: challenge.user2.username,
          photo: challenge.user2.photo,
          myScore: challenge.user1Score,
          theirScore: challenge.user2Score,
          isRead: challenge.user1IsRead,
        };
        if (
          challenge.user1Result.length == NUMBER_OF_PROBLEM &&
          challenge.user2Result.length == NUMBER_OF_PROBLEM
        ) {
          result.push(temp);
        } else if (challenge.whoTurn == 1) {
          myTurn.push(temp);
        } else if (challenge.whoTurn == 2) {
          theirTurn.push(temp);
        }
      } else if (challenge.user2Id == userId) {
        temp = {
          challengeId: challenge._id,
          userId: challenge.user1Id,
          firstname: challenge.user1.firstname,
          lastname: challenge.user1.lastname,
          username: challenge.user1.username,
          photo: challenge.user1.photo,
          myScore: challenge.user2Score,
          theirScore: challenge.user1Score,
          isRead: challenge.user2IsRead,
        };
        if (
          challenge.user1Result.length == NUMBER_OF_PROBLEM &&
          challenge.user2Result.length == NUMBER_OF_PROBLEM
        ) {
          result.push(temp);
        } else if (challenge.whoTurn == 1) {
          theirTurn.push(temp);
        } else if (challenge.whoTurn == 2) {
          myTurn.push(temp);
        }
      }
    }
    return res
      .status(200)
      .json({ succes: true, data: { myTurn, theirTurn, result } });
  } catch (err) {
    if (err)
      return res.status(500).json({ succes: false, error: err.toString() });
    else
      return res
        .status(400)
        .json({ succes: false, error: "Something went wrong" });
  }
};

exports.getFinalChallengeResult = async (req, res) => {
  const challengeId = req.query.challengeId;
  const userId = req.query.userId;
  try {
    var challenge = await Challenge.aggregate([
      {
        $match: {
          _id: ObjectId(challengeId),
          $or: [{ user1Id: ObjectId(userId) }, { user2Id: ObjectId(userId) }],
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user1Id",
          foreignField: "_id",
          as: "user1",
        },
      },
      { $unwind: "$user1" },
      {
        $lookup: {
          from: "users",
          localField: "user2Id",
          foreignField: "_id",
          as: "user2",
        },
      },
      { $unwind: "$user2" },
    ]);

    challenge = challenge[0];
    var out;
    if (challenge.user1Id == userId) {
      out = {
        me: {
          result: challenge.user1Result,
          score: challenge.user1Score,
          photo: challenge.user1.photo,
          username: challenge.user1.username,
          firstname: challenge.user1.firstname,
          lastname: challenge.user1.lastname,
          time: parseFloat(challenge.user1Time),
          gainExp: challenge.user1GainExp,
          gainCoin: challenge.user1GainCoin,
        },
        opponent: {
          result: challenge.user2Result,
          score: challenge.user2Score,
          photo: challenge.user2.photo,
          username: challenge.user2.username,
          firstname: challenge.user2.firstname,
          lastname: challenge.user2.lastname,
          time: parseFloat(challenge.user2Time),
        },
      };
    } else {
      out = {
        me: {
          result: challenge.user2Result,
          score: challenge.user2Score,
          photo: challenge.user2.photo,
          username: challenge.user2.username,
          firstname: challenge.user2.firstname,
          lastname: challenge.user2.lastname,
          time: parseFloat(challenge.user2Time),
          gainExp: challenge.user2GainExp,
          gainCoin: challenge.user2GainCoin,
        },
        opponent: {
          result: challenge.user1Result,
          score: challenge.user1Score,
          photo: challenge.user1.photo,
          username: challenge.user1.username,
          firstname: challenge.user1.firstname,
          lastname: challenge.user1.lastname,
          time: parseFloat(challenge.user1Time),
        },
      };
    }
    return res.status(200).json({ success: true, data: out });
  } catch (err) {
    if (!challenge)
      return res
        .status(400)
        .json({ success: false, error: "Cannot find the challenge" });
    else if (err)
      return res.status(500).json({ success: false, error: err.toString() });
    else
      return res
        .status(400)
        .json({ succes: false, error: "Something went wrong" });
  }
};
