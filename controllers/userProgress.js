const UserProgress = require("../models/UserProgress");
const Subtopic = require("../models/Subtopic");
const { DIFFICULTY } = require("../utils/const");

exports.updateNumberOfProblemofUser = async (
  userId,
  subtopicName,
  difficulty
) => {
  let subtopic = await Subtopic.findOne({ subtopicName: subtopicName });
  let userProgress = await UserProgress.findOne({ userId: userId });
  if (!userProgress) {
    userProgress = new UserProgress({
      userId: userId,
      problems: [
        {
          subject: subtopic.subject,
          topic: subtopic.topic,
          subtopic: subtopic.subtopicName,
          totalAmount: 0,
          difficulty: [
            {
              difficultyName: DIFFICULTY.EASY,
              amount: 0,
            },
            {
              difficultyName: DIFFICULTY.MEDIUM,
              amount: 0,
            },
            {
              difficultyName: DIFFICULTY.HARD,
              amount: 0,
            },
          ],
        },
      ],
    });
  }
  let problem = userProgress.problems.find(problem => problem.subtopic == subtopicName);
  if (!problem) {
    problem = {
      subject: subtopic.subject,
      topic: subtopic.topic,
      subtopic: subtopic.subtopicName,
      totalAmount: 0,
      difficulty: [
        {
          difficultyName: DIFFICULTY.EASY,
          amount: 0,
        },
        {
          difficultyName: DIFFICULTY.MEDIUM,
          amount: 0,
        },
        {
          difficultyName: DIFFICULTY.HARD,
          amount: 0,
        },
      ],
    };
    problem.difficulty.find(e => e.difficultyName == difficulty).amount++;
    problem.totalAmount++;
    userProgress.problems.push(problem);
  } else {
    problem.difficulty.find(e => e.difficultyName == difficulty).amount++;
    problem.totalAmount++;
  }
  userProgress = await userProgress.save();
  return userProgress;
};
