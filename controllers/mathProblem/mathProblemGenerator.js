const { generateScientificNotation } = require("./scientificNotation/scientificNotation");
const { generateMeaningOfExponents } = require("./meaningOfExponents/meaningOfExponents");
const { generateOperationsOfExponents } = require("./operationsOfExponents/operationsOfExponents");
const { SUPTOPIC } = require("./const");

const mathGenerate = ({ subtopicName, difficulty }) => {
  switch (subtopicName) {
    case SUPTOPIC.MEANING_OF_EXPONENTS:
      return generateMeaningOfExponents(subtopicName, difficulty);
    case SUPTOPIC.OPERATION_OF_EXPONENTS:
      return generateOperationsOfExponents(subtopicName, difficulty);
    case SUPTOPIC.SCIENTIFIC_NOTATION:
      return generateScientificNotation(subtopicName, difficulty);
    default:
      return "Default";
  }
};

module.exports = { mathGenerate };
