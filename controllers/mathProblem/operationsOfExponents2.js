const Problem = require("../../models/Problem");
const Answer = require("../../models/Answer");
const Hint = require("../../models/Hint");
const { randInt, shuffle, baseSelector } = require("./globalFunction");
const { DIFFICULTY, ANSWER_TYPE, ALPHABET } = require("../../utils/const")

const generateOperationsOfExponents = async (subtopicName, difficulty) => {
  switch (difficulty) {
    case DIFFICULTY.EASY:
      break;
    case DIFFICULTY.MEDIUM:
      return "Not Implement";
      break;
    case DIFFICULTY.HARD:
      return "Not Implement";
      break;
  }
}

module.exports = {generateOperationsOfExponents};