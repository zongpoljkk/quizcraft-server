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
  moveThePoint,
  genAddSubStn,
  getStn,
  stnString,
  genSolution,
  randFloat,
} = require("./scientificNotationFunction");
const { PROBLEM_TITLE, SUFFIX } = require("./const");

const generateScientificNotation = async (subtopicName, difficulty) => {
  let problemTitle, problemBody, answerBody, hintBody, choices;
  let solution, answerType, answerForDisplay, checkAnswerType;
  let a, n, stn, num, opt, nn, ff, allPos, allInt, rand;
  let i, m, min, baseOut, positiveBase, solutionList;
  let problem, problemId, answer, hint, newProblem, newAnswer, newHint;
  let termNum;
  let baseList, nList, randList, temp;
  switch (difficulty) {
    case DIFFICULTY.EASY:
      nn = randInt(1, 9);
      ff = String(randInt(1, 999));
      if (ff[ff.length - 1] == 0) {
        for (i in ff) {
          if (ff[ff.length - 1] == 0) ff = ff.substring(0, ff.length - 1);
        }
      }
      a = `${nn}.${ff}`;
      n = randInt(1, 10, true);
      stn = `${a}*10^[${n}]`;
      num = moveThePoint(a, n);
      opt = randInt(1, 2);
      switch (opt) {
        case 1:
          problemTitle = PROBLEM_TITLE.FIND_STN;
          problemBody = num;
          answerBody = stn;
          answerForDisplay = stn.replace("*", "{*}");
          checkAnswerType = CHECK_ANSWER_TYPE.EQUAL_STRING;
          answerType = ANSWER_TYPE.MATH_INPUT;
          hintBody = `เขียนเลขให้อยู่ในรูป a*10^[n] โดยที่ 1 <= a < 10 \nเลื่อนจุดไปทาง${
            n < 0 ? `ขวา ${-n} หน่วย` : `ซ้าย ${n} หน่วย`
          }`;
          solution = "";
          temp = num;
          absN = Math.abs(n);
          for (i = 0; i < absN; i++) {
            temp = moveThePoint(temp, n < 0 ? 1 : -1);
            solution +=
              i == 0
                ? `${temp}*10^[${n < 0 ? -(i + 1) : i + 1}]`
                : `\n${temp}*10^[${n < 0 ? -(i + 1) : i + 1}]`;
          }
          solution = problemBody + "\n" + solution;
          break;
        case 2:
          problemTitle = "จงเขียนตัวเลขแทนจำนวนต่อไปนี้โดยไม่ใช้เลขยกกำลัง";
          problemBody = stn;
          answerBody = num;
          answerForDisplay = answerBody;
          checkAnswerType = CHECK_ANSWER_TYPE.EQUAL_STRING;
          answerType = ANSWER_TYPE.MATH_INPUT;
          hintBody = `เลื่อนจุดไปทาง${
            n < 0 ? `ซ้าย ${-n} หน่วย` : `ขวา ${n} หน่วย`
          }`;
          solution = "";
          temp = a;
          absN = Math.abs(n);
          for (i = 0; i < absN; i++) {
            temp = moveThePoint(temp, n < 0 ? -1 : 1);
            if (absN - i - 1 == 0) {
              solution += i == 0 ? `${temp}` : `\n${temp}`;
            } else {
              solution +=
                i == 0
                  ? `${temp}*10^[${n < 0 ? -(absN - i - 1) : absN - i - 1}]`
                  : `\n${temp}*10^[${n < 0 ? -(absN - i - 1) : absN - i - 1}]`;
            }
          }
          solution = problemBody + "\n" + solution;
          break;
      }
      break;
    case DIFFICULTY.MEDIUM:
      problemTitle = PROBLEM_TITLE.FIND_VALUE_STN;
      problemBody = "";
      opt = randInt(1, 2);
      opt = 2;
      switch (opt) {
        case 1:
          allInt = randInt(0, 1);
          allInt = 0;
          termNum = randInt(2, 4);
          baseList = [];
          nList = [];
          baseOut = 0;
          randList = Array.from({ length: termNum }, () => randInt(0, 1));
          n = randInt(3, 10, true);
          solution = "";
          for (i = 0; i < termNum; i++) {
            if (allInt) {
              a = randInt(1, 10);
            } else {
              a = randFloat(10);
            }
            stn = stnString(a, n);
            baseList.push(a);
            nList.push(n);
            if (i == 0) {
              problemBody += randList[i] ? `${stn}` : `-${stn}`;
            } else {
              problemBody += randList[i] ? `+${stn}` : `-${stn}`;
            }
            baseOut = math.add(
              baseOut,
              randList[i] ? math.bignumber(a) : math.bignumber(-a)
            );
          }
          [{ solution, solutionList }] = genSolution(baseList, nList, randList);
          answerBody = solutionList[solutionList.length - 1];
          if (problemBody != solutionList[0]) {
            solution = problemBody + "/n" + solution;
          }
          answerForDisplay = answerBody.replace("*", "{*}");
          checkAnswerType = CHECK_ANSWER_TYPE.EQUAL_STRING;
          answerType = ANSWER_TYPE.MATH_INPUT;
          //create hint
          hintBody =
            "ถ้าเลขยกกำลังเท่ากัน เราสามารถนำเลขที่คูณอยู่ข้างหน้าเลขยกกำลังมาบวกลบกันได้เลย" +
            "\nเช่น 3*10^[3]+2*10^[3] = (3+2)*10^[3] = 5*10^[3]";
          break;
        case 2://1.5*2*10^[2] = 3*10^[2] → ตัวเลขคูณกับสัญกรณ์ → ตอบเป็นสัญกรณ์วิทยาศาสตร์ 
          problemTitle = PROBLEM_TITLE.FIND_VALUE_STN;
          termNum = randInt(2,3);
          baseList = [];
          nList = [];
          baseOut = 1;
          allInt = randInt(0,1);
          for (i=0; i<termNum; i++) {
            if (allInt) {
              a = randInt(2,10);
            } else {
              a = randInt(0,1) ? randInt(2,10) : randFloat(10);
            }
            baseList.push(a);
            baseOut = math.multiply(math.bignumber(baseOut),math.bignumber(a));
          }
          a = baseList.join("*");
          problemBody = a ;
          //`*10^[${degreeOut}]`;
          termNum = randInt(1,2);
          let degreeOut = 0;
          for (i=0; i<termNum; i++) {
            n = randInt(2, 10, true);
            nList.push(n);
            problemBody += `*10^[${n}]`
            degreeOut += n;
          }
          a = `${nn}.${ff}`;
          stn = `${a}*10^[${n}]`;
          num = moveThePoint(a, n);
          console.log(baseOut)

          //create solution
          solution = problemBody;
          solution += `\n${baseOut}*10^[${degreeOut}]`;
          answerBody = getStn(baseOut,degreeOut)
          solution += "\n" + answerBody;

          break;
        case 3:
          problemTitle = PROBLEM_TITLE.FIND_STN;
          let suffixList = [SUFFIX.TEN_THOUSAND,SUFFIX.TEN_THOUSAND,SUFFIX.HUNDRED_THOUSAND,SUFFIX.MILLION]
          let suffixIndex = randInt(0,suffixList.length-1);
          break;
      }
      break;
    case DIFFICULTY.HARD:
      break;
  }
  console.log("---------------------------------------------");
  console.log("problemTitle", problemTitle);
  console.log("problemBody", problemBody);
  console.log("answerBody", answerBody);
  console.log("solution", `\n${solution}`);
  console.log("hintBody", hintBody);
  console.log("answerForDisplay", answerForDisplay);
  console.log("checkAnswerType", checkAnswerType);
  console.log("answerType", answerType);
  console.log("choices", choices);
  // console.log("allPos", allPos);
  console.log("---------------------------------------------");
};

generateScientificNotation("สัญกรณ์วิทยาศาสตร์", DIFFICULTY.MEDIUM);
// console.log(getStn(290,3))
// console.log(genSolution([3, 1, 23], [4, 5, 4], [0, 0, 1]));
return 0;
