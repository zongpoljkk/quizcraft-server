exports.MIN_PROBLEM = 1;

exports.MAX_PROBLEM = 30;

const POINTS_POSSIBLE = 1000;

// According to Kahoot's official site
exports.calculatePoints = (usedTime, timeGiven) => {
  const firstStep = (usedTime*1.0) / timeGiven
  const secondStep = firstStep / 2;
  const thirdStep = 1 - secondStep;
  const fourthStep = thirdStep * POINTS_POSSIBLE;
  const finalStep = Math.round(fourthStep);
  return finalStep;
}