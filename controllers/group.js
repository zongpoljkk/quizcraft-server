const Group = require("../models/Group");
const Pin = require("../models/Pin");
const User = require("../models/User");
const moment = require("moment");
const { MIN_PROBLEM, MAX_PROBLEM } = require("../utils/group");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

const getPin = async (date) => {
  let prefix = moment(date).format('DDMMYY');
  var pin = await Pin.findOneAndUpdate(
    { prefix: prefix },
    { $inc: { count: 1 } },
    { upsert: true, new: true}
  )
  let newPin = parseInt(pin.prefix) + parseInt(pin.count);
  newPin = `${newPin}`
  while (newPin.length < 6) {
    newPin = "0" + newPin;
  }
  return newPin;
}

exports.createGroup = async (req, res) => {
  const creatorId = req.body.creatorId;
  const subject = req.body.subject;
  const topic = req.body.topic;
  const subtopic = req.body.subtopic;
  const difficulty = req.body.difficulty;
  const numberOfProblem = req.body.numberOfProblem;
  const timePerProblem = req.body.timePerProblem;
  const isPlay = req.body.isPlay;
  const date = new Date();
  const pin = await getPin(date);

  if (numberOfProblem < MIN_PROBLEM || numberOfProblem > MAX_PROBLEM) {
    return res.status(400).json({succes:false, error: "The number of problems should be from 1 to 30"});
  }
  const user = await User.findById(creatorId);
  if (!user) {
    return res.status(400).json({succes:false, error: "Wrong creatorId, cannot find the user"});
  }
  const group = new Group({
    pin: pin,
    creatorId: creatorId,
    subject: subject,
    topic: topic,
    subtopic: subtopic,
    difficulty: difficulty,
    numberOfProblem: numberOfProblem,
    timePerProblem: timePerProblem,
    members: isPlay? [{
      userId: creatorId,
      username: user.username}] 
      : [],
  })
  group.save((err, newGroup) => {
    if (err) return res.status(500).json({succes:false, error:err});
    else if (!newGroup) return res.status(400).json({succes:false, error: "Cannot create group"});
    else return res.status(200).json({succes:true, data: {groupId: newGroup._id, pin: newGroup.pin} });
  })
}

exports.getAllGroupMembers = async (req, res) => {
  const groupId = req.query.groupId;
  try {
    var group = await Group.findById(groupId, { "members.username": 1 });
    return res.status(200).json({succes:true, data: {members: group.members, numberOfMembers: group.members.length} });
  } catch (err) {
    return res.status(500).json({succes:false, error:err.toString()});
  }
}

exports.deleteGroup = async (req, res) => {
  const body = req.body;
  if (!body) {
    return res.status(400).json({
      success: false,
      error: "You must provide a body to update",
    });
  }

  Group.findOneAndDelete(
    {
      _id: body.groupId,
      creatorId: body.userId,
    },
    (err, user) => {
      if (err) {
        return res.status(500).json({ success: false, error: err });
      }
      if (!user) {
        return res.status(400).json({ success: false, error: "no data" });
      }
      return res.status(200).json({ success: true, data: "delete group success!" });
    }
  );
};

exports.leaveGroup = async (req, res) => {
  const body = req.body;
  if (!body) {
    return res.status(400).json({
      success: false,
      error: "You must provide a body to update",
    });
  }

  Group.findOneAndUpdate(
    {
      _id: body.groupId,
      members: { $elemMatch: { userId: { $eq: body.userId } } },
    },
    { $pull: { members: { userId: body.userId } } },
    { new: true },
    (err, user) => {
      if (err) {
        return res.status(500).json({ success: false, error: err });
      }
      if (!user) {
        return res.status(400).json({ success: false, error: "no data" });
      }
      return res.status(200).json({ success: true, data: "leave group success!" });
    }
  );
};

exports.getGroupScoreboard = async (req, res) => {
  const groupId = req.query.groupId;
  const userId = req.query.userId;
  
  Group.aggregate(
    [
      {
        $match: {
          _id: ObjectId(groupId),
        },
      },
      {
        $addFields: {
          isCreator: { $eq: [ "$creatorId", ObjectId(userId) ] },
        },
      },
      { $unwind: "$members" },
      { $sort: { "members.point": -1 } },
      {
        $group: {
          _id: "$_id",
          members: { $push: "$members" },
          numberOfProblem: { $first: "$numberOfProblem" },
          isCreator: { $first: "$isCreator"}
        },
      },
      {
        $addFields: {
          userIndex: {
            $add: [{ $indexOfArray: ["$members.userId", ObjectId(userId)] }, 1],
          },
        },
      },
    ],
    (err, group) => {
      if (err) {
        return res.status(500).json({ success: false, error: err });
      }
      if (!group) {
        return res.status(400).json({ success: false, error: "no data" });
      }
      return res.status(200).json({ success: true, data: group });
    }
  );
};

exports.joinGroup = async (req, res) => {
  const body = req.body;
  if (!body) {
    return res.status(400).json({
      success: false,
      error: "You must provide a body to update",
    });
  }

  var user = await User.findById(body.userId);

  Group.findOneAndUpdate(
    {
      pin: body.pin
    },
    { $addToSet: { members: { userId: body.userId, username: user.username } } },
    { new: true },
    (err, group) => {
      if (err) {
        return res.status(500).json({ success: false, error: err });
      }
      if (!group) {
        return res.status(400).json({ success: false, error: "no data" });
      }
      return res.status(200).json({ success: true, data: { groupId: group._id } });
    }
  );
};

exports.getGroupGame = async (req, res) => {
  const groupId = req.query.groupId;
  const userId = req.query.userId;
  try {
    var group = await Group.aggregate([
      {
        $match: {
          _id: ObjectId(groupId)
        },
      },
      {
        $addFields: {
          problemId: { $arrayElemAt: [ "$problems" , "$currentIndex" ] }
        }
      },
      {
        $lookup: {
          from: "problems",
          localField: "problemId",
          foreignField: "_id",
          as: "problem",
        },
      },
      { $unwind: "$problem" },
      {
        $lookup: {
          from: "answers",
          localField: "problemId",
          foreignField: "problemId",
          as: "answer",
        },
      },
      { $unwind: "$answer" },
      {
        $project: {
          _id: 1,
          currentIndex: 1,
          numberOfProblem: 1,
          timePerProblem: 1,
          user: {
            $filter: {
              input: "$members",
              as: "member",
              cond: { $eq: [ "$$member.userId", ObjectId(userId) ] }
            }
          },
          problem: {
            _id: 1,
            choices: 1,
            body: 1,
            answerType: 1,
            title: 1
          },
          answer: {
            body: 1
          }
        }
      },
    ]);

    group = group[0];
    var groupGame = {
      _id: group._id,
      currentIndex: group.currentIndex,
      numberOfProblem: group.numberOfProblem,
      timePerProblem: parseFloat(group.timePerProblem),
      user: group.user[0],
      problem: {
        _id: group.problem._id,
        choices: group.problem.choices,
        body: group.problem.body,
        answerType: group.problem.answerType,
        title: group.problem.title,
        correctAnswer: group.answer.body
      }
    };
    return res.status(200).json({ success: true, data: groupGame });
  } catch (err) {
    if (!group)
      return res.status(400).json({ success: false, error: "Cannot find this group" });
    else if (err)
      return res.status(500).json({ success: false, error: err.toString() });
    else
      return res.status(400).json({ succes: false, error: "Something went wrong" });
  };
};
