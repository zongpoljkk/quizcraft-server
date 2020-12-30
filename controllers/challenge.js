const User = require("../models/User");
const Challenge = require("../models/Challenge");
const Problem = require("../models/Problem");
const { NUMBER_OF_PROBLEM } = require("../utils/challenge");

const randInt = (start, end) => {
  return Math.floor(Math.random() * (end - start + 1)) + start;
};

exports.randomChallenge = async (req, res) => {
  const user1Id = req.body.user1Id;
  const subject = req.body.subject;
  const subtopicName = req.body.subtopicName;
  const difficulty = req.body.difficulty;
  var problem,problems = [];
  try {
    //step1: random user2 that user2 != user1
    const user1 = await User.findOne({ _id: user1Id }, { _id:1, firstname:1, lastname:1, username:1, photo:1 });
    let count = await User.countDocuments({_id: {$ne: user1Id}});
    let random = randInt(0,count-1);
    const randomUser = await User.findOne({_id: {$ne: user1Id} }, { _id:1, firstname:1, lastname:1, username:1, photo:1 }).skip(random);
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
            users: { $nin: [user1Id,user2Id] },
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
    await challenge.save();
    return res.status(200).json({ success: true, data: {challengeId: challenge._id, user1, user2: randomUser}});
  } catch (err) {
    return res.status(400).json({ success: false, error: err });
  }
}

exports.specificChallenge = async (req, res) => {
  const user1Id = req.body.user1Id;
  const username = req.body.username;
  const subject = req.body.subject;
  const subtopicName = req.body.subtopicName;
  const difficulty = req.body.difficulty;
  var problem,problems = [];
  try {
    //step1: check if username is exist and not same as user1
    const user1 = await User.findOne({ _id: user1Id }, { _id:1, firstname:1, lastname:1, username:1, photo:1 });
    const user2 = await User.findOne({ username: username }, { _id:1, firstname:1, lastname:1, username:1, photo:1 });
    if (!user2) return res.status(400).json({success: false, error: "Cannot find the user"});
    if (user2._id == user1Id) return res.status(400).json({success: false, error: "Cannot challenge yourself"});
    const user2Id = user2._id;

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
            users: { $nin: [user1Id,user2Id] },
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

    // save to database
    await challenge.save();
    return res.status(200).json({ success: true, data: {challengeId: challenge._id, user1, user2}});
  } catch (err) {
    return res.status(400).json({ success: false, error: err });
  }
}

exports.readChallenge = async (req, res) => {
  const challengeId = req.body.challengeId;
  const userId = req.body.userId;
  await Challenge.findOne({ _id: challengeId, $or: [ {user1Id: userId}, {user2Id: userId} ] } )
    .exec((err, challenge) => {
      if (err) return res.status(500).json({ success: false, error: err });
      else if (!challenge) return res.status(400).json({ success: false, error: "Challenge not exist" });
      if (challenge.user1Id == userId) challenge.user1IsRead = true;
      else challenge.user2IsRead = true;
      challenge.save((err, newChallenge) => {
        if (err) return res.status(500).json({ success: false, error: err });
        else if (!newChallenge) return res.status(400).json({ success: false, error: "Cannot update challenge" });
        return res.status(200).json({ success: true, isRead: newChallenge.user1Id == userId? newChallenge.user1IsRead:newChallenge.user2IsRead })
      })
    })
}

exports.getFinalChallengeResult = async (req, res) => {
  return res.send("TODO");
}