const Problem = require("../../models/Problem");
const Answer = require("../../models/Answer");
const Hint = require("../../models/Hint");
const {generateScientificNotation} = require("./scientificNotation");
const {generateMeaningOfExponents} = require("./meaningOfExponents");
const {generateOperationsOfExponents} = require("./operationsOfExponents")

const EASY = "EASY";
const MEDIUM = "MEDIUM";
const HARD = "HARD";
const alphabet = "abcdefghijklmnopqrstuvwxyz";

const mathGenerate = ({ subtopicName, difficulty }) => {
  switch (subtopicName) {
    case "ความหมายของเลขยกกำลัง":
      return generateMeaningOfExponents(subtopicName, difficulty);
    case "การดำเนินการของเลขยกกำลัง":
      return generateOperationsOfExponents(subtopicName, difficulty);
    case "สัญกรณ์วิทยาศาสตร์":
      return generateScientificNotation(subtopicName, difficulty);
    default:
      return "Default";
  }
};

module.exports = { mathGenerate };
