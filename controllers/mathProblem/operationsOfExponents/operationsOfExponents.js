const Problem = require("../../../models/Problem");
const Answer = require("../../../models/Answer");
const Hint = require("../../../models/Hint");
const math = require("mathjs");
const { randInt, shuffle, baseSelector } = require("../globalFunction");
const {
  CHECK_ANSWER_TYPE,
  DIFFICULTY,
  ANSWER_TYPE,
  ALPHABET,
} = require("../../../utils/const");
const {
  multipleConcat,
  genSolution,
  diverse,
  baseSelectorNoInt,
  multipleExponentialString,
} = require("./operationsOfExponentsFunction");
const { PROPERTY_EXPO, PROBLEM_TITLE } = require("./const");

const generateOperationsOfExponents = async (subtopicName, difficulty) => {
  let problemTitle, problemBody, answerBody, hintBody;
  let solution, answerType, answerForDisplay, checkAnswerType;
  let expo, positiveBase, opt, buttom;
  let problem, problemId, answer, hint, newProblem, newAnswer, newHint;
  let i, temp, temp2, allPos, degreeSum, degreeSum2;
  let choices, solutionList;
  let base, degree, randList, baseList, degreeList, termNum;
  let base1, base2, isLessThanZero, isDivided;
  switch (difficulty) {
    case DIFFICULTY.EASY:
      problemTitle = PROBLEM_TITLE.SIMPLE_EXPO;
      opt = randInt(1, 4);
      switch (opt) {
        case 1: // 3^[2]*3^[3] = 3^[5]
          termNum = randInt(2, 4);
          allPos = randInt(0, 1);
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
          hintBody = PROPERTY_EXPO.MULTIPLY;
          break;
        case 2: //(3^[5])/(3^[2]) = 3^[3]
          base = randInt(2, 10);
          allPos = randInt(0, 1);
          if (allPos) {
            degreeList = Array.from({ length: 2 }, () => randInt(1, 5));
          } else {
            degreeList = Array.from({ length: 2 }, () => randInt(1, 5, true));
          }
          problemBody =
            base < 0
              ? `((${base})^[${degreeList[0]}])/((${base})^[${degreeList[1]}])`
              : `(${base}^[${degreeList[0]}])/(${base}^[${degreeList[1]}])`;
          [{ solution, solutionList }] = genSolution(
            [base],
            [degreeList[0]],
            [base],
            [degreeList[1]]
          );
          answerBody = solutionList[solutionList.length - 1];
          answerForDisplay = answerBody;
          answerType = ANSWER_TYPE.MATH_INPUT;
          checkAnswerType = CHECK_ANSWER_TYPE.MATH_EVALUATE;
          //create hint
          hintBody = PROPERTY_EXPO.DIVIDE;
          break;
        case 3: //3^[0] = 1;
          problemTitle = PROBLEM_TITLE.FIND_VALUE_EXPO;
          base = randInt(2, 10);
          expo = base < 0 ? `(${base})^[0]` : `${base}^[0]`;
          // answerType = randInt(0,1)? ANSWER_TYPE.MATH_INPUT : ANSWER_TYPE.RADIO_CHOICE;
          answerType = ANSWER_TYPE.MATH_INPUT;
          problemBody = expo;
          answerBody = 1;
          answerForDisplay = answerBody;
          solution = problemBody + "\n" + answerBody;
          checkAnswerType = CHECK_ANSWER_TYPE.MATH_EVALUATE;
          hintBody = PROPERTY_EXPO.POWER_ZERO;
          break;
        case 4: //3^[-2] = 1/(3^[2]) or 1/9
          base = randInt(2, 10);
          degree = -1 * randInt(2, 10);
          // answerType = randInt(0,1)? ANSWER_TYPE.MATH_INPUT : ANSWER_TYPE.RADIO_CHOICE;
          answerType = ANSWER_TYPE.MATH_INPUT;
          problemBody =
            base < 0 ? `(${base})^[${degree}` : `${base}^[${degree}]`;
          answerBody =
            base < 0
              ? `1/((${base})^[${-degree}])`
              : `1/(${base}^[${-degree}])`;
          answerForDisplay = answerBody;
          checkAnswerType = CHECK_ANSWER_TYPE.MATH_EVALUATE;
          solution = problemBody + "\n" + answerBody;
          hintBody = PROPERTY_EXPO.POWER_NEGATIVE;
          break;
      }
      break;
    case DIFFICULTY.MEDIUM:
      problemTitle = PROBLEM_TITLE.SIMPLE_EXPO;
      problemBody = "";
      opt = randInt(1, 5);
      switch (opt) {
        case 1: //49*7^[2]
          termNum = randInt(3, 4);
          base = randInt(2, 25, true); //random (+-)[2,25]
          positiveBase = Math.abs(base);
          [{ randList, termNum }] = diverse(termNum);
          degreeList = [];
          baseList = [];
          solution = "";
          temp = "";
          for (i = 0; i < termNum; i++) {
            if (randList[i]) {
              if (1 <= positiveBase && positiveBase <= 7) {
                degree = randInt(2, 4);
              } else if (7 < positiveBase && positiveBase <= 11) {
                degree = randInt(2, 3);
              } else if (11 < positiveBase) {
                degree = 2;
              }
            } else {
              degree = randInt(0, 10, true);
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
          answerBody = solutionList[solutionList.length - 1];
          answerForDisplay = answerBody;
          checkAnswerType = CHECK_ANSWER_TYPE.MATH_EVALUATE;

          // create hint
          hintBody = `ลองเปลี่ยนเลขธรรมดาให้เป็นเลขยกกำลังที่ฐานเท่ากับเลขยกกำลังตัวอื่นดูสิ`;
          break;
        case 2: //(1/2)^2*(0.5)^[3]
          let bList = [2, 4, 5, 10, 20, 25, 50, 100];
          let b = bList[randInt(0, bList.length - 1)];
          let a = randInt(1, 99, true); //random (+-)[1,99]
          let fraction = `(${a}/${b})`;
          let decimal = math.divide(math.bignumber(a), math.bignumber(b));
          termNum = randInt(3, 4);
          [{ randList, termNum }] = diverse(termNum);
          temp = "";
          degreeList = [];
          baseList = Array.from({ length: termNum }, () => decimal);
          allPos = randInt(0, 1);
          for (i = 0; i < termNum; i++) {
            base = randList[i] ? fraction : decimal;
            if (allPos) {
              degree = randInt(0, 10);
            } else {
              degree = randInt(0, 10, true);
            }
            degreeList.push(degree);
            problemBody += multipleConcat(base, degree, i);
            temp += multipleConcat(decimal, degree, i);
          }
          [{ solution, solutionList }] = genSolution(baseList, degreeList);
          solution = problemBody + "\n" + temp + "\n" + solution;

          //create answer
          answerType = ANSWER_TYPE.MATH_INPUT;
          answerBody = solutionList[solutionList.length - 1];
          answerForDisplay = answerBody;
          checkAnswerType = CHECK_ANSWER_TYPE.MATH_EVALUATE;

          //create hint
          hintBody = `ถ้าสังเกตดี ๆ จะเห็นว่าฐานเท่ากันนะ,\n${PROPERTY_EXPO.MULTIPLY}`;
          break;
        case 3: //similar to easy but harder and base is not int -> multiply
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
          hintBody = PROPERTY_EXPO.MULTIPLY;
          break;
        case 4: //similar to easy but harder and base is not int -> divided
          base = baseSelectorNoInt();
          degreeList = Array.from({ length: 2 }, () => randInt(1, 5, true));
          problemBody =
            base < 0
              ? `((${base})^[${degreeList[0]}])/((${base})^[${degreeList[1]}])`
              : `(${base}^[${degreeList[0]}])/(${base}^[${degreeList[1]}])`;
          [{ solution, solutionList }] = genSolution(
            [base],
            [degreeList[0]],
            [base],
            [degreeList[1]]
          );
          answerBody = solutionList[solutionList.length - 1];
          answerForDisplay = answerBody;
          answerType = ANSWER_TYPE.MATH_INPUT;
          checkAnswerType = CHECK_ANSWER_TYPE.EQUAL_STRING;
          //create hint
          hintBody = PROPERTY_EXPO.DIVIDE;
          break;
        case 5:
          problemTitle = PROBLEM_TITLE.FIND_VALUE_EXPO;
          termNum = randInt(2, 3);
          base = baseSelector();
          baseList = [];
          degreeList = [];
          degreeSum = 0;
          buttom = "";
          for (i = 0; i < termNum; i++) {
            degree = randInt(2, 10);
            degreeSum += degree;
            degreeList.push(degree);
            baseList.push(base);
            problemBody += multipleConcat(base, degree, i);
          }
          termNum = randInt(1, 2);
          if (termNum == 1) {
            baseList2 = [base];
            degreeList2 = [degreeSum];
            buttom += multipleConcat(base, degreeSum, 0);
          } else if (termNum == 2) {
            temp = randInt(1, degreeSum - 1);
            baseList2 = [base, base];
            degreeList2 = [temp, degreeSum - temp];
            buttom += multipleConcat(base, temp, 0);
            buttom += multipleConcat(base, degreeSum - temp, 1);
          }
          problemBody = `(${problemBody})/(${buttom})`;
          [{ solution, solutionList }] = genSolution(
            baseList,
            degreeList,
            baseList2,
            degreeList2
          );
          answerBody = 1;
          answerForDisplay = answerBody;
          answerType = ANSWER_TYPE.MATH_INPUT;
          checkAnswerType = CHECK_ANSWER_TYPE.MATH_EVALUATE;
          solution = problemBody + "\n" + solution + "\n1";
          hintBody = PROPERTY_EXPO.MULTIPLY;
          hintBody += `\n${PROPERTY_EXPO.DIVIDE}`;
          break;
      }
      break;
    case DIFFICULTY.HARD:
      problemTitle = PROBLEM_TITLE.SIMPLE_EXPO;
      problemBody = "";
      // opt = randInt(1,3);
      opt = 3;
      switch (opt) {
        case 1: // (a^[-3]*a^[2]) / (a^[-1]*a^[5]) = a^[-5]
          base = baseSelector();
          termNum = randInt(2, 5);
          problemBody = buttom = "";
          baseList = [];
          baseList2 = [];
          degreeList = [];
          degreeList2 = [];
          allPos = randInt(0, 1);
          for (i = 0; i < termNum; i++) {
            if (allPos) {
              degree = randInt(0, 15);
            } else {
              degree = randInt(0, 15, true);
            }
            degreeList.push(degree);
            baseList.push(base);
            problemBody += multipleConcat(base, degree, i);
          }
          for (i = 0; i < termNum; i++) {
            degree = randInt(0, 15, true);
            degreeList2.push(degree);
            baseList2.push(base);
            buttom += multipleConcat(base, degree, i);
          }
          problemBody = `(${problemBody})/(${buttom})`;

          [{ solution, solutionList }] = genSolution(
            baseList,
            degreeList,
            baseList2,
            degreeList2
          );
          solution = problemBody + "\n" + solution;
          answerBody = solutionList[solutionList.length - 1];
          answerForDisplay = answerBody;
          answerType = ANSWER_TYPE.MATH_INPUT;
          checkAnswerType = ALPHABET.includes(base)
            ? CHECK_ANSWER_TYPE.EQUAL_STRING
            : CHECK_ANSWER_TYPE.MATH_EVALUATE;
          hintBody = PROPERTY_EXPO.MULTIPLY;
          hintBody += `\n${PROPERTY_EXPO.DIVIDE}`;
          break;
        case 2: // (-3)^[2]*3^[1] = 3^[3]
          base1 = randInt(2, 25, false); //random [2,25]
          base2 = -1 * base1; //(-base1)
          isLessThanZero = 0;
          isDivided = randInt(0, 1);
          termNum = randInt(2, 4);
          allPos = randInt(0, 1);
          [{ randList, termNum }] = diverse(termNum);
          degreeList = [];
          baseList = [];
          degreeSum = 0;
          for (i = 0; i < termNum; i++) {
            base = randList[i] ? base1 : base2;
            baseList.push(base);
            if (allPos) {
              degree = randInt(1, 15);
            } else {
              degree = randInt(1, 15, true);
            }
            degreeList.push(degree);
            if ((base < 0) & (degree % 2 != 0)) {
              //พจน์นี้ติดลบ
              isLessThanZero = isLessThanZero ? 0 : 1;
            }
            degreeSum += degree;
            problemBody += multipleConcat(base, degree, i);
          }

          if (isDivided) {
            termNum = randInt(1, 3);
            [{ randList, termNum }] = diverse(termNum);
            degreeList2 = [];
            baseList2 = [];
            degreeSum2 = 0;
            buttom = "";
            for (i = 0; i < termNum; i++) {
              base = randList[i] ? base1 : base2;
              baseList2.push(base);
              if (allPos) {
                degree = randInt(1, 15);
              } else {
                degree = randInt(1, 15, true);
              }
              degreeList2.push(degree);
              if ((base < 0) & (degree % 2 != 0)) {
                //พจน์นี้ติดลบ
                isLessThanZero = isLessThanZero ? 0 : 1;
              }
              degreeSum2 += degree;
              buttom += multipleConcat(base, degree, i);
            }
            problemBody = `(${problemBody})/(${buttom})`;
            degreeSum -= degreeSum2;
          }
          //create solution
          if (isDivided) {
            [
              {
                solution,
                solutionList,
                baseListOut: baseList,
                degreeListOut: degreeList,
              },
            ] = genSolution(baseList, degreeList, baseList2, degreeList2);
          } else {
            [
              {
                solution,
                solutionList,
                baseListOut: baseList,
                degreeListOut: degreeList,
              },
            ] = genSolution(baseList, degreeList);
          }
          baseList.forEach((e, i) => {
            if (e < 0) {
              degree = degreeList[i];
              if (degree % 2 == 0) {
                baseList[i] = e * -1;
              } else {
                baseList[i] = `(-1)*${e * -1}`;
              }
            }
          });
          solution += `\n${multipleExponentialString(baseList, degreeList)}`;

          // create answer
          answerBody = isLessThanZero
            ? `-${base1}^[${degreeSum}]`
            : `${base1}^[${degreeSum}]`;
          answerForDisplay = answerBody;
          checkAnswerType = CHECK_ANSWER_TYPE.MATH_EVALUATE;
          answerType = ANSWER_TYPE.MATH_INPUT;
          solution += `\n${answerBody}`;
          if (problemBody != solutionList[0]) {
            solution = problemBody + "\n" + solution;
          }

          //create hint
          hintBody = `ถ้าเลขติดลบยกกำลังด้วยเลขคู่จะกลายเป็นค่าบวก เช่น (-3)^[2] = 9 = 3^[2]`;
          hintBody += `\nแต่ถ้าเลขติดลบยกกำลังด้วยเลขคี่จะกลายเป็นค่าลบ เช่น (-3)^[3] = -27 = -(3^[3])`;
          hintBody += `\n${PROPERTY_EXPO.MULTIPLY}`;
          if (isDivided) hintBody += `\n${PROPERTY_EXPO.DIVIDE}`;
          break;
        case 3: // (-5)^[2]*25*5^[7] = 5^[2]*5^[2]*5^[7] = 5^[(2+2+7)] = 5^[11]
          base1 = randInt(2, 25);
          base2 = -1 * base1; //(-base1)
          isLessThanZero = 0;
          isDivided = randInt(0, 1);
          termNum = randInt(3, 5);
          temp = "";
          degreeList = [];
          baseList = [];
          randList = [0, 1, 2];
          while (randList.length < termNum) {
            randList.push(randInt(0, 2));
          }
          randList = await shuffle(randList);
          degreeSum = 0;
          for (i = 0; i < termNum; i++) {
            if (randList[i] == 1) {
              //-5 base2
              degree = randInt(1, 15, true);
              degreeList.push(degree);
              baseList.push(base2);
              degreeSum += degree;
              problemBody += multipleConcat(base2, degree, i);
              temp += multipleConcat(base2, degree, i);
              if (degree % 2 != 0) {
                //พจน์นี้ติดลบ
                isLessThanZero = isLessThanZero ? 0 : 1;
              }
            } else if (randList[i] == 2) {
              //25
              if (1 <= base1 && base1 <= 7) {
                degree = randInt(2, 4);
              } else if (7 < base1 && base1 <= 11) {
                degree = randInt(2, 3);
              } else if (11 < base1) {
                degree = 2;
              }
              if (degree % 2 != 0) {
                base = base2;
                isLessThanZero = isLessThanZero ? 0 : 1;
              } else {
                base = base1;
              }
              degreeList.push(degree);
              baseList.push(base);
              degreeSum += degree;
              problemBody += multipleConcat(base ** degree, 1, i);
              temp += multipleConcat(base, degree, i);
            } else {
              //5
              degree = randInt(1, 15, true);
              degreeList.push(degree);
              baseList.push(base1);
              degreeSum += degree;
              problemBody += multipleConcat(base1, degree, i);
              temp += multipleConcat(base1, degree, i);
            }
          }

          if (isDivided) {
            termNum = randInt(1, 3);
            randList = [];
            while (randList.length < termNum) {
              randList.push(randInt(0, 2));
            }
            degreeList2 = [];
            baseList2 = [];
            degreeSum2 = 0;
            buttom = "";
            temp2 = "";
            for (i = 0; i < termNum; i++) {
              if (randList[i] == 1) {
                //-5 base2
                degree = randInt(1, 15, true);
                degreeList2.push(degree);
                baseList2.push(base2);
                degreeSum2 += degree;
                buttom += multipleConcat(base2, degree, i);
                temp2 += multipleConcat(base2, degree, i);
                if (degree % 2 != 0) {
                  //พจน์นี้ติดลบ
                  isLessThanZero = isLessThanZero ? 0 : 1;
                }
              } else if (randList[i] == 2) {
                //25
                if (1 <= base1 && base1 <= 7) {
                  degree = randInt(2, 4);
                } else if (7 < base1 && base1 <= 11) {
                  degree = randInt(2, 3);
                } else if (11 < base1) {
                  degree = 2;
                }
                if (degree % 2 != 0) {
                  base = base2;
                  isLessThanZero = isLessThanZero ? 0 : 1;
                } else {
                  base = base1;
                }
                degreeList2.push(degree);
                baseList2.push(base);
                degreeSum2 += degree;
                buttom += multipleConcat(base ** degree, 1, i);
                temp2 += multipleConcat(base, degree, i);
              } else {
                //5
                degree = randInt(1, 15, true);
                degreeList2.push(degree);
                baseList2.push(base1);
                degreeSum2 += degree;
                buttom += multipleConcat(base1, degree, i);
                temp2 += multipleConcat(base1, degree, i);
              }
            }
            problemBody = `(${problemBody})/(${buttom})`;
            temp = `(${temp})/(${temp2})`;
            degreeSum -= degreeSum2;
          }

          solution = "";
          if (isDivided) {
            [
              {
                solution,
                solutionList,
                baseListOut: baseList,
                degreeListOut: degreeList,
              },
            ] = genSolution(baseList, degreeList, baseList2, degreeList2);
          } else {
            [
              {
                solution,
                solutionList,
                baseListOut: baseList,
                degreeListOut: degreeList,
              },
            ] = genSolution(baseList, degreeList);
          }

          solution = problemBody + "\n" + temp + "\n" + solution;
          baseList.forEach((e, i) => {
            if (e < 0) {
              degree = degreeList[i];
              if (degree % 2 == 0) {
                baseList[i] = e * -1;
              } else {
                baseList[i] = `(-1)*${e * -1}`;
              }
            }
          });
          solution += `\n${multipleExponentialString(baseList, degreeList)}`;
          
          // create answer
          answerBody = isLessThanZero
            ? `-${base1}^[${degreeSum}]`
            : `${base1}^[${degreeSum}]`;
          answerForDisplay = answerBody;
          checkAnswerType = CHECK_ANSWER_TYPE.MATH_EVALUATE;
          answerType = ANSWER_TYPE.MATH_INPUT;
          solution += `\n${answerBody}`;

          // create hint 
          hintBody = `ลองเปลี่ยนเลขธรรมดาให้เป็นเลขยกกำลังที่ฐานเท่ากับเลขยกกำลังตัวอื่นดูสิ`;
          hintBody += `\nถ้าเลขติดลบยกกำลังด้วยเลขคู่จะกลายเป็นค่าบวก เช่น (-3)^[2] = 9 = 3^[2]`;
          hintBody += `\nแต่ถ้าเลขติดลบยกกำลังด้วยเลขคี่จะกลายเป็นค่าลบ เช่น (-3)^[3] = -27 = -(3^[3])`;
          hintBody += `\n${PROPERTY_EXPO.MULTIPLY}`;
          if (isDivided) hintBody += `\n${PROPERTY_EXPO.DIVIDE}`;
          break;
      }
      break;
  }
  // create model
  problem = new Problem({
    body: problemBody,
    subtopicName: subtopicName,
    difficulty: difficulty,
    answerType: answerType,
    title: problemTitle,
    choices: answerType == ANSWER_TYPE.RADIO_CHOICE? choices : [],
  });
  problemId = problem._id;
  answer = new Answer({
    problemId: problemId,
    body: answerBody,
    solution: solution,
    answerForDisplay: answerForDisplay,
    checkAnswerType: checkAnswerType
  });
  hint = new Hint({ problemId: problemId, body: hintBody });
  
  // save to database
  try {
    newProblem = await problem.save();
    newAnswer = await answer.save();
    newHint = await hint.save();
    return [{ problem:newProblem, answer:newAnswer, hint:newHint }];
  } catch (err) {
    console.log(err)
    return err;
  }
};

module.exports = { generateOperationsOfExponents };
