const Problem = require("../../../models/Problem");
const Answer = require("../../../models/Answer");
const Hint = require("../../../models/Hint");
const math = require("mathjs");
const { randInt, shuffle, baseSelector } = require("../globalFunction");
const { CHECK_ANSWER_TYPE, DIFFICULTY, ANSWER_TYPE, ALPHABET } = require("../../../utils/const");
const {
  multipleConcat,
  genSolution,
  diverse,
  baseSelectorNoInt
} = require("./operationsOfExponentsFunction");

const generateOperationsOfExponents = async (subtopicName, difficulty) => {
  let problemTitle, problemBody, answerBody, hintBody, solution, answerType, answerForDisplay, checkAnswerType;
  let expo, num, rand, positiveBase, opt;
  let problem, problemId, answer, hint, newProblem, newAnswer, newHint;
  let i, temp, allPos;
  let expoList, numList, choices, solutionList;
  let base, degree, randList, baseList, degreeList, termNum, degreeListOut;
  switch (difficulty) {
    case DIFFICULTY.EASY:
      problemTitle = "จงทำเลขยกกำลังต่อไปนี้ให้เป็นรูปอย่างง่าย";
      opt = randInt(1, 4);
      // opt = 2;
      switch (opt) {
        case 1: // 3^[2]*3^[3] = 3^[5]
          termNum = randInt(2, 4);
          allPos = randInt(0,1);
          baseList = [];
          degreeList = [];
          problemBody = "";
          base = randInt(2, 10);
          for (i = 0; i < termNum; i++) {
            if (allPos) {
              degree = randInt(1, 5);
            } else {
              degree = randInt(1, 5, true);
            }
            degreeList.push(degree);
            baseList.push(base);
            problemBody += multipleConcat(base, degree, i);
          }
          [{ solution, solutionList }] = genSolution(baseList, degreeList);
          solution = problemBody + "\n" + solution;
          answerBody = solutionList[solutionList.length - 1];
          answerForDisplay = answerBody;
          answerType = ANSWER_TYPE.MATH_INPUT;
          checkAnswerType = CHECK_ANSWER_TYPE.MATH_EVALUATE;
          //create hint
          hintBody = `a^[m]*a^[n] = a^[(m+n)] | สมบัติการคูณของเลขยกกำลัง`;
          break;
        case 2: //(3^[5])/(3^[2]) = 3^[3]
          base = randInt(2, 10);
          allPos = randInt(0,1);
          if (allPos) {
            degreeList = Array.from({ length: 2 }, () => randInt(1, 5));
          } else {
            degreeList = Array.from({ length: 2 }, () => randInt(1, 5, true));
          }
          problemBody =
            base < 0
              ? `((${base})^[${degreeList[0]}])/((${base})^[${degreeList[1]}])`
              : `(${base}^[${degreeList[0]}])/(${base}^[${degreeList[1]}])`;
          [{ solution, solutionList }] = genSolution([base], [degreeList[0]], [base], [degreeList[1]]);
          answerBody = solutionList[solutionList.length - 1];
          answerForDisplay = answerBody;
          answerType = ANSWER_TYPE.MATH_INPUT;
          checkAnswerType = CHECK_ANSWER_TYPE.MATH_EVALUATE;
          //create hint
          hintBody = `(a^[m])/(a^[n]) = a^[(m-n)] เมื่อ a ไม่เท่ากับ 0 | สมบัติการหารของเลขยกกำลัง`;
          break;
        case 3: //3^[0] = 1;
          problemTitle = "จงหาค่าของเลขยกกำลงต่อไปนี้";
          base = randInt(2, 10);
          expo = base < 0? `(${base})^[0]` : `${base}^[0]`;
          // answerType = randInt(0,1)? ANSWER_TYPE.MATH_INPUT : ANSWER_TYPE.RADIO_CHOICE;
          answerType = ANSWER_TYPE.MATH_INPUT;
          problemBody = expo;
          answerBody = 1;
          answerForDisplay = answerBody;
          checkAnswerType = CHECK_ANSWER_TYPE.MATH_EVALUATE;
          hintBody = `a^[0] = 1 เมื่อ a ไม่เท่ากับ 0`;
          break;
        case 4: //3^[-2] = 1/(3^[2]) or 1/9
          base = randInt(2, 10);
          degree = -1*randInt(2, 10);
          // answerType = randInt(0,1)? ANSWER_TYPE.MATH_INPUT : ANSWER_TYPE.RADIO_CHOICE;
          answerType = ANSWER_TYPE.MATH_INPUT;
          problemBody = base < 0? `(${base})^[${degree}` : `${base}^[${degree}]`;
          answerBody = base < 0? `1/((${base})^[${-degree}])` : `1/(${base}^[${-degree}])`;
          answerForDisplay = answerBody;
          checkAnswerType = CHECK_ANSWER_TYPE.MATH_EVALUATE;
          hintBody = `a^[-n] = 1/(a^[n])`;
          break;
      }
      break;
    case DIFFICULTY.MEDIUM:
      problemTitle = "จงทำเลขยกกำลังต่อไปนี้ให้เป็นรูปอย่างง่าย";
      problemBody = "";
      termNum = randInt(3, 4);
      // opt = randInt(1, 4);
      opt = 4;
      switch (opt) {
        case 1: //49*7^[2]
          base = randInt(2, 25, true); //random (+-)[2,25]
          positiveBase = Math.abs(base);
          [{ randList, termNum }] = diverse(termNum);
          degreeList = [];
          baseList = [];
          solution = "";
          temp = "";
          for (i = 0; i < termNum; i++) {
            if (randList[i]) {
              if(1 <= positiveBase && positiveBase <= 7) {
                degree = randInt(2, 4);
              } else if (7 < positiveBase && positiveBase <= 11) {
                degree = randInt(2, 3);
              } else if (11 < positiveBase) {
                degree = 2;
              }
            } else {
              degree = randInt(0, 10, true); // (+,-)[0,50]
            }
            degreeList.push(degree);
            baseList.push(base);
            if (randList[i]) {
              problemBody += multipleConcat(base ** degree, 1, i);
            } else problemBody += multipleConcat(base, degree, i);

            temp += multipleConcat(base, degree, i);
          }
          [{ solution, solutionList }] = genSolution(baseList, degreeList);
          solution = problemBody + "\n" + temp + "\n" + solution;
          
          // create answer
          answerType = ANSWER_TYPE.MATH_INPUT;
          answerBody = solutionList[solutionList.length-1];
          answerForDisplay = answerBody;
          checkAnswerType = CHECK_ANSWER_TYPE.MATH_EVALUATE;
          
          // create hint
          hintBody = `ลองเปลี่ยนเลขธรรมดาให้เป็นเลขยกกำลังที่ฐานเท่ากับเลขยกกำลังตัวอื่นดูสิ`;
          break;
        case 2: //(1/2)^2*(0.5)^[3]
          let bList = [2, 4, 5, 10, 20, 25, 50, 100];
          let b = bList[randInt(0,bList.length-1)];
          let a = randInt(1, 99, true); //random (+-)[1,99]
          let fraction = `(${a}/${b})`;
          let decimal = math.divide(math.bignumber(a),math.bignumber(b));

          [{ randList, termNum }] = diverse(termNum);
          temp = "";
          degreeList = [];
          baseList = Array.from({ length: termNum }, () => decimal);
          for (i = 0; i < termNum; i++) {
            base = randList[i] ? fraction : decimal;
            degree = randInt(0, 10, true);
            degreeList.push(degree);
            problemBody += multipleConcat(base, degree, i);
            temp += multipleConcat(decimal, degree, i);
          }
          [{ solution, solutionList }] = genSolution(baseList, degreeList);
          solution = problemBody + "\n" + temp + "\n" + solution;
          
          //create answer
          answerType = ANSWER_TYPE.MATH_INPUT;
          answerBody = solutionList[solutionList.length-1];
          answerForDisplay = answerBody;
          checkAnswerType = CHECK_ANSWER_TYPE.MATH_EVALUATE;
          
          //create hint
          hintBody = `ถ้าสังเกตดี ๆ จะเห็นว่าฐานเท่ากันนะ,\na^[m]*a^[n] = a^[(m+n)] | สมบัติการคูณของเลขยกกำลัง`;
          break;
        case 3: //similar to easy but harder and base is not int
          termNum = randInt(2, 4);
          baseList = [];
          degreeList = [];
          problemBody = "";
          base = baseSelectorNoInt();
          for (i = 0; i < termNum; i++) {
            degree = randInt(1, 10, true);
            degreeList.push(degree);
            baseList.push(base);
            problemBody += multipleConcat(base, degree, i);
          }
          [{ solution, solutionList }] = genSolution(baseList, degreeList);
          solution = problemBody + "\n" + solution;
          answerBody = solutionList[solutionList.length - 1];
          answerForDisplay = answerBody;
          answerType = ANSWER_TYPE.MATH_INPUT;
          checkAnswerType = CHECK_ANSWER_TYPE.EQUAL_STRING;
          //create hint
          hintBody = `a^[m]*a^[n] = a^[(m+n)] | สมบัติการคูณของเลขยกกำลัง`;
          break;
        case 4:
          base = baseSelectorNoInt();
          degreeList = Array.from({ length: 2 }, () => randInt(1, 5, true));
          problemBody =
            base < 0
              ? `((${base})^[${degreeList[0]}])/((${base})^[${degreeList[1]}])`
              : `(${base}^[${degreeList[0]}])/(${base}^[${degreeList[1]}])`;
          [{ solution, solutionList }] = genSolution([base], [degreeList[0]], [base], [degreeList[1]]);
          answerBody = solutionList[solutionList.length - 1];
          answerForDisplay = answerBody;
          answerType = ANSWER_TYPE.MATH_INPUT;
          checkAnswerType = CHECK_ANSWER_TYPE.EQUAL_STRING;
          //create hint
          hintBody = `(a^[m])/(a^[n]) = a^[(m-n)] เมื่อ a ไม่เท่ากับ 0 | สมบัติการหารของเลขยกกำลัง`;
          break;
        case 5:
          break;
      }
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
  console.log("answerForDisplay", answerForDisplay);
  console.log("checkAnswerType", checkAnswerType);
  console.log("answerType", answerType);
  console.log("choices", choices);
  console.log("allPos", allPos);
  console.log("---------------------------------------------");
};

// let [{solution, solutionList, baseListOut, degreeListOut}] = genSolution([2,3,2,4],[3,2,1,1])
// console.log(solution)
// console.log(solutionList)
// console.log(baseListOut)
// console.log(degreeListOut)
// console.log("...")
generateOperationsOfExponents("การดำเนินการของเลขยกกำลัง", DIFFICULTY.MEDIUM);
return 0;

module.exports = { generateOperationsOfExponents };
