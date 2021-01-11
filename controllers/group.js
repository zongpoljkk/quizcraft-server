const Group = require("../models/Group");
const Pin = require("../models/Pin");
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
  const group = new Group({
    pin: pin,
    creatorId: creatorId,
    subject: subject,
    topic: topic,
    subtopic: subtopic,
    difficulty: difficulty,
    numberOfProblem: numberOfProblem,
    timePerProblem: timePerProblem,
    members: isPlay? [creatorId] : [],
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
    var group = await Group.aggregate([
      {
        $match: {
          _id: ObjectId(groupId),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "members",
          foreignField: "_id",
          as: "MembersInfo",
        },
      },
      {
        $project: {
          "MembersInfo.username": 1,
        }
      }
    ]);
    group = group[0].MembersInfo;
    return res.status(200).json({succes:true, data: {members: group, numberOfMembers: group.length} });
  } catch (err) {
    return res.status(500).json({succes:false, error:err.toString()});
  }
}