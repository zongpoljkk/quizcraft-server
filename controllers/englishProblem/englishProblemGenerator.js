const Problem = require("../../models/Problem");
const Answer = require("../../models/Answer");
const Hint = require("../../models/Hint");
const {generateGrammar} = require("./grammar");
const EASY = "EASY";
const MEDIUM = "MEDIUM";
const HARD = "HARD";
const alphabet = "abcdefghijklmnopqrstuvwxyz";

const englishGenerate = ({ subtopicName, difficulty }) => {
  switch (subtopicName) {
    case "Grammar":
      return generateGrammar(subtopicName, difficulty);
    default:
      return "Default";
  }
};
