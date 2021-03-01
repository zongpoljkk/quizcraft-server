exports.MIN_PROBLEM = 1;

exports.MAX_PROBLEM = 30;

exports.POINTS_POSSIBLE = 1000;

// According to Kahoot's official site
exports.calculatePoints = (usedTime, timeGiven, maxPointsPerProblem) => {
  const firstStep = (usedTime*1.0) / timeGiven
  const secondStep = firstStep / 2;
  const thirdStep = 1 - secondStep;
  const fourthStep = thirdStep * maxPointsPerProblem;
  const finalStep = Math.round(fourthStep);
  return finalStep;
}

exports.STATE = {
  PROBLEM: "PROBLEM",
  ANSWERED_CORRECT: "ANSWERED_CORRECT",
  ANSWERED_WRONG: "ANSWERED_WRONG",
  SHOW_ANSWER_CORRECT: "SHOW_ANSWER_CORRECT",
  SHOW_ANSWER_WRONG: "SHOW_ANSWER_WRONG"
}