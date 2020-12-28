const User = require("../models/User");
const Challenge = require("../models/Challenge");
const Problem = require("../models/Problem");

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
    
    //step2: get 5 question for both user (both user should never seen all questions before)
    for (i=0; i<5; i++) {
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
    await challenge.save();
    return res.status(200).json({ success: true, data: {challengeId: challenge._id, user1, user2: randomUser}});
  } catch (err) {
    return res.status(400).json({ success: false, error: err });
  }
}