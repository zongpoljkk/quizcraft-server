const Problem = require("../../models/Problem");
const Answer = require("../../models/Answer");
const Hint = require("../../models/Hint");
const math = require("mathjs");
const EASY = "EASY";
const MEDIUM = "MEDIUM";
const HARD = "HARD";
const alphabet = "abcdefghijklmnopqrstuvwxyz";

const randInt = (start, end, haveNegative) => {
  if (haveNegative) {
    return (
      (Math.floor(Math.random() * (end - start + 1)) + start) *
      (-1) ** Math.floor(Math.random() * 2)
    );
  } else {
    return Math.floor(Math.random() * (end - start + 1)) + start;
  }
};

const generateMeaningOfExponents = async (subtopicName, difficulty) => {
  var problemTitle,problemBody,answerBody,hintBody,solution;
  var expo, num;
  switch (difficulty) {
    case EASY:

      return "Not Implement";
    case MEDIUM:
      return "Not Implement";
    case HARD:
      return "Not Implement";
  }
};

module.exports = {generateMeaningOfExponents};

