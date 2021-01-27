const { generateGrammar } = require("./grammar");

const englishGenerate = ({ subtopicName, difficulty }) => {
  switch (subtopicName) {
    case "Grammar":
      return generateGrammar(subtopicName, difficulty);
    default:
      return "Default";
  }
};

module.exports = { englishGenerate };