const Problem = require("../../../models/Problem");
const Answer = require("../../../models/Answer");
const Hint = require("../../../models/Hint");
const { randInt, shuffle, baseSelector } = require("../globalFunction");
const { DIFFICULTY, ANSWER_TYPE, ALPHABET } = require("../../../utils/const");
const {
  multipleConcat,
  genSolution,
} = require("./operationsOfExponentsFunction");

const generateOperationsOfExponents = async (subtopicName, difficulty) => {
  let problemTitle, problemBody, answerBody, hintBody, solution, answerType;
  let expo, num, rand, positiveBase, opt;
  let problem, problemId, answer, hint, newProblem, newAnswer, newHint;
  let i, temp;
  let expoList, numList, choices, solutionList;
  let base, degree, randList, baseList, degreeList, termNum;
  switch (difficulty) {
    case DIFFICULTY.EASY:
      problemTitle = "จงทำเลขยกกำลังต่อไปนี้ให้เป็นรูปอย่างง่าย";
      // opt = randInt(1, 4);
      opt = 2;
      switch (opt) {
        case 1: // 3^[2]*3^[3] = 3^[5]
          termNum = randInt(2, 4);
          baseList = [];
          degreeList = [];
          problemBody = "";
          base = randInt(2, 10);
          for (i = 0; i < termNum; i++) {
            degree = randInt(1, 5, true);
            degreeList.push(degree);
            baseList.push(base);
            problemBody += multipleConcat(base, degree, i);
          }
          [{ solution, solutionList }] = genSolution(baseList, degreeList);
          solution = problemBody + "\n" + solution;
          answerBody = solutionList[solutionList.length - 1];
          answerType = ANSWER_TYPE.MATH_INPUT;
          //create hint
          hintBody = `a^[m]*a^[n] = a^[(m+n)] | สมบัติการคูณของเลขยกกำลัง`;
          break;
        case 2: //(3^[5])/(3^[2]) = 3^[3]
          base = randInt(2, 10);
          degreeList = Array.from({ length: 2 }, () => randInt(1, 5, true));
          problemBody =
            base < 0
              ? `((${base})^[${degreeList[0]}])/((${base})^[${degreeList[1]}])`
              : `(${base}^[${degreeList[0]}])/(${base}^[${degreeList[1]}])`;
          [{ solution, solutionList }] = genSolution([base], [degreeList[0]], [base], [degreeList[1]]);
          answerBody = solutionList[solutionList.length - 1];
          answerType = ANSWER_TYPE.MATH_INPUT;
          //create hint
          hintBody = `(a^[m])/(a^[n]) = a^[(m-n)] เมื่อ a ไม่เท่ากับ 0 | สมบัติการหารของเลขยกกำลัง`;
          break;
        case 3: //3^[0] = 1;
          base = randInt(2, 10);
          expo = base<0? `(${base})^[0]` : `${base}^[0]`;
      }
      break;
    case DIFFICULTY.MEDIUM:
      return "Not Implement";
      break;
    case DIFFICULTY.HARD:
      return "Not Implement";
      break;
  }
  console.log("---------------------------------------------");
  console.log("problemTitle", problemTitle);
  console.log("problemBody", problemBody);
  console.log("answerBody", answerBody);
  console.log("solution", solution);
  console.log("hintBody", hintBody);
  console.log("---------------------------------------------");
};

// let [{solution, solutionList, baseListOut, degreeListOut}] = genSolution([2,3,2,4],[3,2,1,1])
// console.log(solution)
// console.log(solutionList)
// console.log(baseListOut)
// console.log(degreeListOut)
// console.log("...")
generateOperationsOfExponents("การดำเนินการของเลขยกกำลัง", "EASY");
return 0;

module.exports = { generateOperationsOfExponents };
