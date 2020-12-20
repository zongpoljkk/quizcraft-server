const Problem = require("../../models/Problem");
const Answer = require("../../models/Answer");
const Hint = require("../../models/Hint");
const {generateAdverbsOfManner} = require("./adverbsOfManner");
const EASY = "EASY";
const MEDIUM = "MEDIUM";
const HARD = "HARD";
const alphabet = "abcdefghijklmnopqrstuvwxyz";

const englishGenerate = ({ subtopicName, difficulty }) => {
  switch (subtopicName) {
    case "adverbsOfManner":
      return generateAdverbsOfManner(subtopicName, difficulty);
    default:
      return "Default";
  }
};
