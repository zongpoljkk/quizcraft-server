const User = require("../models/User");
const Challenge = require("../models/Challenge");
const Problem = require("../models/Problem");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const {NUMBER_OF_PROBLEM} = require("../utils/challenge")

const randInt = (start, end) => {
  return Math.floor(Math.random() * (end - start + 1)) + start;
};

exports.randomChallenge = async (req, res) => {
  const user1Id = req.body.user1Id;
  const subject = req.body.subject;
  const subtopicName = req.body.subtopicName;
  const difficulty = req.body.difficulty;
  var problem,problems = [];
  
  //step1: random user2 that user2 != user1
  let count = await User.countDocuments({_id: {$ne: user1Id}});
  let random = randInt(0,count-1);
  let randomUser = await User.findOne({_id: {$ne: user1Id} }, { _id:1, firstname:1, lastname:1, username:1 }).skip(random);
  const user2Id = randomUser._id;
  
  //step2: get <NUMBER_OF_PROBLEM> question for both user (both user should never seen all questions before)
  for (i=0; i<NUMBER_OF_PROBLEM; i++) {
    problem = await Problem.findOneAndUpdate(
      {
        subtopicName: subtopicName,
        difficulty: difficulty,
        users: { $nin: [user1Id,user2Id] },
      },
      { $addToSet: { users: [user1Id,user2Id] } },
      { projection: { _id: 1 } }
    );
    if (problem == null) {
      //generate problem
      switch (subject) {
        case MATH:
          try {
            await mathGenerate({ subtopicName, difficulty });
          } catch (err) {
            return res.status(400).json({ success: false, error: err });
          }
          break;
        case ENG:
          try {
            await englishGenerate({ subtopicName, difficulty });
          } catch (err) {
            return res.status(400).json({ success: false, error: err });
          }
          break;
      }
      problem = await Problem.findOneAndUpdate(
        {
          subtopicName: subtopicName,
          difficulty: difficulty,
          users: { $ne: userId },
        },
        { $addToSet: { users: [user1Id,user2Id] } },
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
  })

  //save to database
  try {
    await challenge.save();
    return res.status(200).json({ success: true, challenge})
  } catch (err) {
    return res.status(400).json({ success: false, error: err });
  }
}

exports.getAllMyChallenges = async (req, res) => {
  const userId = req.query.userId;
  const subtopicName = req.query.subtopicName;
  const difficulty = req.query.difficulty;
  const challenges = await Challenge.aggregate([
    { $match: 
      { subtopicName:subtopicName, difficulty:difficulty, 
        $or: [ {user1Id: ObjectId(userId)}, {user2Id: ObjectId(userId)} ] 
      }
    },
    { 
      $lookup: {
        from: "users",
        localField: "user1Id",
        foreignField: "_id",
        as: "user1"
      } 
    },
    { $unwind: "$user1"},
    {
      $lookup: {
        from: "users",
        localField: "user2Id",
        foreignField: "_id",
        as: "user2"
      } 
    },
    { $unwind: "$user2"},
    { $project: 
      { _id:1, whoTurn:1, user1Score:1, user2Score:1, user1Id:1, user2Id:1, user1Result:1, user2Result:1,
        user1: {
          photo:1, firstname:1, lastname: 1, username: 1
        }, 
        user2: {
          photo:1, firstname:1, lastname: 1, username: 1
        } 
      } 
    }
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
        theirScore: challenge.user2Score
      }
      if (challenge.user1Result.length == NUMBER_OF_PROBLEM && challenge.user1Result.length == NUMBER_OF_PROBLEM) {
        result.push(temp);
      }
      else if (challenge.whoTurn == 1) {
        myTurn.push(temp);
      } 
      else if (challenge.whoTurn == 2) {
        theirTurn.push(temp);
      }
    }
    else if (challenge.user2Id == userId) {
      temp = {
        challengeId:challenge._id,
        userId: challenge.user1Id,
        firstname: challenge.user1.firstname,
        lastname: challenge.user1.lastname,
        username: challenge.user1.username,
        photo: challenge.user1.photo,
        myScore: challenge.user2Score,
        theirScore: challenge.user1Score
      }
      if (challenge.user1Result.length == NUMBER_OF_PROBLEM && challenge.user1Result.length == NUMBER_OF_PROBLEM) {
        result.push(temp);
      }
      else if (challenge.whoTurn == 1) {
        theirTurn.push(temp);
      }
      else if (challenge.whoTurn == 2) {
        myTurn.push(temp);
      }
    }
  }

  return res.send({myTurn, theirTurn, result});
}