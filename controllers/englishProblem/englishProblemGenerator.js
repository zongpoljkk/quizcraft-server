const Problem = require("../../models/Problem");
const Answer = require("../../models/Answer");
const Hint = require("../../models/Hint");
const EASY = "EASY";
const MEDIUM = "MEDIUM";
const HARD = "HARD";
const alphabet = "abcdefghijklmnopqrstuvwxyz";

const englishGenerate = ({ subtopicName, difficulty }) => {
  switch (subtopicName) {
    case "Grammar":
      return genarateGrammar(subtopicName, difficulty);
    default:
      return "Default";
  }
};

const genarateGrammar = (subtopicName, difficulty) => {
  var out = '';
  switch (difficulty) {
    case EASY:
      break;
  }
};
