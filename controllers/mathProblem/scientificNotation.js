const Problem = require("../../models/Problem");
const Answer = require("../../models/Answer");
const Hint = require("../../models/Hint");
const EASY = "EASY";
const MEDIUM = "MEDIUM";
const HARD = "HARD";
const alphabet = "abcdefghijklmnopqrstuvwxyz";

const generateScientificNotation = async (subtopicName, difficulty) => {
  switch (difficulty) {
    case EASY:
      return "Not Implement";
    case MEDIUM:
      return "Not Implement";
    case HARD:
      return "Not Implement";
  }
};

module.exports = {generateScientificNotation};

