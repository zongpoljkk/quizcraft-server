const Group = require("../models/Group");
const Pin = require("../models/Pin");
const User = require("../models/User");
const Problem = require("../models/Problem");
const moment = require("moment");
const { MIN_PROBLEM, MAX_PROBLEM } = require("../utils/group");
const { SUBJECT } = require("../utils/const");
const { mathGenerate } = require("./mathProblem/mathProblemGenerator");
const { englishGenerate } = require("./englishProblem/englishProblemGenerator");
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

exports.genProblemsWhenGroupStart = async (req, res) => {
  const groupId = req.body.groupId;
  try {
    const group = await Group.findById(groupId);
    const numberOfProblem = group.numberOfProblem;
    const difficulty = group.difficulty;
    const subtopicName = group.subtopic;
    const subject = group.subject;
    var problem;
    var problems = [];
    var memberIdList = [];
    for (i in group.members) {
      memberIdList.push(group.members[i].userId);
    }
    do {
      problem = await Problem.findOneAndUpdate(
        {
          subtopicName: subtopicName,
          difficulty: difficulty,
          users: { $nin: memberIdList },
        },
        { $addToSet: { users: memberIdList } },
        { projection: { _id: 1 } }
      );
      if (problem == null) {
        //generate problem
        switch (subject) {
          case SUBJECT.MATH:
            await mathGenerate({ subtopicName, difficulty });
            break;
          case SUBJECT.ENG:
            await englishGenerate({ subtopicName, difficulty });
            break;
        }
        problem = await Problem.findOneAndUpdate(
          {
            subtopicName: subtopicName,
            difficulty: difficulty,
            users: { $nin: memberIdList },
          },
          { $addToSet: { users: memberIdList } },
          { projection: { _id: 1 } }
        );
      }
      if (problem) problems.push(problem._id);
    } while (problems.length < numberOfProblem);
    //add problem to group
    await Group.findOneAndUpdate({ _id:groupId }, { problems: problems }, { new: true },(err, newGroup) => {
      if (err) {
        return res.status(500).json({ success: false, error: err.toString() });
      } else if (!newGroup) {
        return res.status(400).json({ success: false, error: "Cannot generate problem and add into Group" });
      } else {
        return res.status(200).json({ success: true, data: { problems: newGroup.problems, numberOfProblem: newGroup.numberOfProblem } });
      }
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, error: err.toString() });
  }
}