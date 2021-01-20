const {generateScientificNotation} = require("./scientificNotation");
const {generateMeaningOfExponents} = require("./meaningOfExponents/meaningOfExponents");
// const {generateOperationsOfExponents} = require("./operationsOfExponents")
const {generateOperationsOfExponents} = require("./operationsOfExponents/operationsOfExponents");

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
