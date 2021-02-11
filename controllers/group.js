const Group = require("../models/Group");
const Pin = require("../models/Pin");
const User = require("../models/User");
const Problem = require("../models/Problem");
const moment = require("moment");
const { MIN_PROBLEM, MAX_PROBLEM } = require("../utils/group");
const { SUBJECT, SSE_TOPIC } = require("../utils/const");
const { mathGenerate } = require("./mathProblem/mathProblemGenerator");
const { englishGenerate } = require("./englishProblem/englishProblemGenerator");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const { sendEventToGroupMember, sendEventToUser } = require("../middlewares");

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
  const userId = req.query.userId;
  try {
    var group = await Group.findById(groupId, { "members.username": 1, "creatorId": 1 });
    return res.status(200).json({succes:true, data: {members: group.members, numberOfMembers: group.members.length, isCreator: userId == group.creatorId} });
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
      res.status(200).json({ success: true, data: "delete group success!" });
      sendEventToGroupMember(body.groupId, SSE_TOPIC.DELETE_GROUP);
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
      res.status(200).json({ success: true, data: "leave group success!" });
      sendEventToGroupMember(body.groupId, SSE_TOPIC.UPDATE_MEMBER);
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
        res.status(200).json({ success: true, data: { problems: newGroup.problems, numberOfProblem: newGroup.numberOfProblem } });
        sendEventToGroupMember(groupId, SSE_TOPIC.START_GAME);
      }
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, error: err.toString() });
  }
}

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
      {
        $unwind: {
          path: "$members",
          preserveNullAndEmptyArrays: true,
        },
      },
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

  Group.findOne({ pin: body.pin }, (err, group) => {
    if (err) {
      return res.status(500).json({ success: false, error: err });
    } else if (!group) {
      return res
        .status(400)
        .json({ success: false, error: "The group does not exist" });
    } else {
      Group.findOneAndUpdate(
        {
          pin: body.pin,
          problems: [],
        },
        {
          $addToSet: {
            members: { userId: body.userId, username: user.username },
          },
        },
        { new: true },
        (err, group) => {
          if (err) {
            return res.status(500).json({ success: false, error: err });
          } else if (!group) {
            return res
              .status(400)
              .json({ success: false, error: "The game has already started" });
          }
          res.status(200).json({ 
            success: true,
            data: { 
              groupId: group._id, 
              groupInfo: { 
                subject: group.subject,
                topic: group.topic,
                subtopic: group.subtopic,
                difficulty: group.difficulty
              } 
            } 
          });
          sendEventToGroupMember(group._id, SSE_TOPIC.UPDATE_MEMBER);
        }
      );
    }
  });
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
        $project: {
          _id: 1,
          currentIndex: 1,
          numberOfProblem: 1,
          timePerProblem: 1,
          creatorId: 1,
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
            title: 1,
            answerForDisplay: 1,
          },
        }
      },
    ]);

    group = group[0];
    var groupGame = {
      _id: group._id,
      currentIndex: group.currentIndex,
      numberOfProblem: group.numberOfProblem,
      timePerProblem: parseFloat(group.timePerProblem),
      isCreator: userId == group.creatorId,
      user: group.user[0],
      problem: {
        _id: group.problem._id,
        choices: group.problem.choices,
        body: group.problem.body,
        answerType: group.problem.answerType,
        title: group.problem.title,
        correctAnswer: group.problem.answerForDisplay
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

exports.resetAfterGameEnd = async (req, res) => {
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
      creatorId: body.userId,
    },
    {
      $set: {
        "members.$[].score": 0,
        "members.$[].point": 0,
        problems: [],
        currentIndex: 0,
      },
    },
    { multi: true },
    (err, user) => {
      if (err) {
        return res.status(500).json({ success: false, error: err });
      }
      if (!user) {
        return res.status(400).json({ success: false, error: "no data" });
      }
      res.status(200).json({ success: true, data: "reset group success!" });
      sendEventToGroupMember(body.groupId, SSE_TOPIC.RESTART_GAME);
    }
  );
};

exports.nextProblem = async (req, res) => {
  const groupId = req.body.groupId;
  const userId = req.userId;

  Group.findOneAndUpdate(
    { _id: groupId, creatorId: userId },
    { $inc: { currentIndex: 1 } , answersNumber: 0},
    { new: true},
    (err, group) => {
      if (err) return res.status(500).json({ success: false, error: err.toString() });
      else if (!group) return res.status(400).json({ success: false, error: "Cannot do next problem" });
      res.status(200).json({ success: true, data: { currentIndex: group.currentIndex }});
      // Server-sent-event
      sendEventToGroupMember(groupId, SSE_TOPIC.NEXT_PROBLEM);
    }
  );
};

exports.getNumberOfAnswer = (req, res) => {
  const groupId = req.query.groupId;
  Group.findById(groupId).exec((err, group) => {
    if (err) return res.status(500).json({ success: false, error: err.toString() });
    else if (!group) return res.status(400).json({ success: false, error: "Group not found" });
    return res.status(200).json({ success: true, data: { numberOfAnswer: group.answersNumber, numberOfMembers: group.members.length } })
  })
}

exports.showAnswer = (req, res) => {
  const groupId = req.query.groupId;
  sendEventToGroupMember(groupId, SSE_TOPIC.SHOW_ANSWER);
}