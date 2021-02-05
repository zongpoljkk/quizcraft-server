const Problem = require("../../../models/Problem");
const math = require("mathjs");
const { randInt } = require("../globalFunction");
const {
  CHECK_ANSWER_TYPE,
  DIFFICULTY,
  ANSWER_TYPE,
} = require("../../../utils/const");
const {
  moveThePoint,
  genAddSubStn,
  getStn,
  stnString,
  stnString2,
  genSolutionAddSub,
  randFloat,
  multipleConcat,
  genSolutionAddSubDiv, 
} = require("./scientificNotationFunction");
const { PROBLEM_TITLE, SUFFIX } = require("./const");
const { bignumber } = require("mathjs");

const generateScientificNotation = async (subtopicName, difficulty) => {
  let problemTitle, problemBody, answerBody, hintBody, choices;
  let solution, answerType, answerForDisplay, checkAnswerType;
  let a, n, stn, num, opt, nn, ff, allInt, rand, n2;
  let i, baseOut, positiveBase, solutionList;
  let problem, answer, newProblem;
  let termNum, baseList, nList, randList;
  let baseList2, nList2, randList2, temp, top, buttom;
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
          hintBody = `เขียนเลขให้อยู่ในรูป {a*10^[n]} โดยที่ {1 <= a < 10} \nเลื่อนจุดไปทาง${
            n < 0 ? `ขวา {${-n}} หน่วย` : `ซ้าย {${n}} หน่วย`
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

          //edit problemBody to show in math
          problemBody = `{${problemBody}}`;

          //edit solution to show in math
          solution = `{${solution.split("\n").join("}\n{")}}`;
          break;
        case 2:
          problemTitle = "จงเขียนตัวเลขแทนจำนวนต่อไปนี้โดยไม่ใช้เลขยกกำลัง";
          problemBody = stn;
          answerBody = num;
          answerForDisplay = answerBody;
          checkAnswerType = CHECK_ANSWER_TYPE.EQUAL_STRING;
          answerType = ANSWER_TYPE.MATH_INPUT;
          hintBody = `เลื่อนจุดไปทาง${
            n < 0 ? `ซ้าย {${-n}} หน่วย` : `ขวา {${n}} หน่วย`
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

          //edit problemBody to show in math
          problemBody = `{${problemBody}}`;

          //edit solution to show in math
          solution = `{${solution.split("\n").join("}\n{")}}`;
          break;
      }
      break;
    case DIFFICULTY.MEDIUM:
      problemTitle = PROBLEM_TITLE.FIND_VALUE_STN;
      problemBody = "";
      opt = randInt(1, 4);
      switch (opt) {
        case 1:
          allInt = randInt(0, 1);
          termNum = randInt(2, 4);
          baseList = [];
          nList = [];
          baseOut = 0;
          randList = Array.from({ length: termNum }, () => randInt(0, 1));
          n = randInt(3, 10, true);
          solution = "";
          for (i = 0; i < termNum; i++) {
            if (allInt) {
              a = randInt(1, 50);
            } else {
              a = randFloat(10);
            }
            stn = stnString2(a, n);
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
          [{ solution, solutionList }] = genSolutionAddSub(baseList, nList, randList);
          answerBody = solutionList[solutionList.length - 1];
          if (problemBody != solutionList[0]) {
            solution = problemBody + "\n" + solution;
          }
          answerForDisplay = answerBody.replace("*", "{*}");
          checkAnswerType = CHECK_ANSWER_TYPE.EQUAL_STRING;
          answerType = ANSWER_TYPE.MATH_INPUT;
          //create hint
          hintBody =
            "ถ้าเลขยกกำลังเท่ากัน เราสามารถนำเลขที่คูณอยู่ข้างหน้าเลขยกกำลังมาบวกลบกันได้เลย" +
            "\nเช่น {3*10^[3]+2*10^[3] = (3+2)*10^[3] = 5*10^[3]}";

          //edit problemBody to show in math
          problemBody = `{${problemBody}}`;

          //edit solution to show in math
          solution = `{${solution.split("\n").join("}\n{")}}`;
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

          //create solution ans answer
          solution = problemBody;
          solution += `\n${baseOut}*10^[${degreeOut}]`;
          answerBody = getStn(baseOut,degreeOut)
          if (`${baseOut}*10^[${degreeOut}]` != answerBody ) {
            solution += "\n" + answerBody;
          }
          answerForDisplay = answerBody.replace("*","{*}");
          checkAnswerType = CHECK_ANSWER_TYPE.EQUAL_STRING;
          answerType = ANSWER_TYPE.MATH_INPUT;

          //create hint TODO
          hintBody = ``;

          //edit problemBody to show in math
          problemBody = `{${problemBody}}`;

          //edit solution to show in math
          solution = `{${solution.split("\n").join("}\n{")}}`;
          break;
        case 3:
          problemTitle = PROBLEM_TITLE.FIND_STN;
          let suffixList = [SUFFIX.THOUSAND,SUFFIX.TEN_THOUSAND,SUFFIX.HUNDRED_THOUSAND,SUFFIX.MILLION]
          let suffix = SUFFIX.MILLION;
          a = randInt(2,1000);
          rand = randInt(0,1);
          if (rand) {
            let suffixIndex = randInt(0,suffixList.length-1);
            let preSuffix = suffixList[suffixIndex];
            problemBody = `{${a}} ${preSuffix.STR}${suffix.STR}`;
            solution = stnString(a,preSuffix.POWER);
            solution += multipleConcat(10,suffix.POWER)
            temp = preSuffix.POWER + suffix.POWER;
            solution += "\n" + stnString(a,temp);
            answerBody = getStn(a,temp);
            solution += "\n" + answerBody;
            //create hint
            hintBody = `${preSuffix.STR} {= ${preSuffix.NUM_STR} = ${preSuffix.EXPO_STR}}`;
            hintBody += `\n${suffix.STR} {= ${suffix.NUM_STR} = ${suffix.EXPO_STR}}`;
          } else {
            problemBody = `{${a}} ${suffix.STR}`;
            solution = stnString(a,suffix.POWER);
            answerBody = getStn(a,suffix.POWER);
            solution += "\n" + answerBody;
            //create hint
            hintBody = `${suffix.STR} {= ${suffix.NUM_STR} = ${suffix.EXPO_STR}}`;
          }
          answerForDisplay = answerBody.replace("*","{*}");
          checkAnswerType = CHECK_ANSWER_TYPE.EQUAL_STRING;
          answerType = ANSWER_TYPE.MATH_INPUT;

          //edit solution to show in math
          solution = `{${solution.split("\n").join("}\n{")}}`;
          solution = problemBody + "\n" + solution;
          break;
        case 4: //การหารง่ายๆ → หารลงตัว
          n = randInt(2,10,true); 
          do {
            n2 = randInt(2,10,true);
          } while (n2 == n);
          buttom = randInt(2,10);
          let answer = randInt(2,25,true);
          a = math.multiply(bignumber(answer),math.bignumber(buttom));
          problemBody = `(${stnString(a,n)})/(${stnString(buttom,n2)})`;
          solution = problemBody;
          solution += "\n" + stnString(answer, n2<0? `(${n}-(${n2}))`:`(${n}-${n2})`);
          solution += "\n" + stnString(answer,n-n2);
          answerBody = getStn(answer,n-n2);
          if (stnString(answer,n-n2) != answerBody) {
            solution += "\n" + answerBody;
          }
          answerForDisplay = answerBody.replace("*10","{*10}");
          checkAnswerType = CHECK_ANSWER_TYPE.EQUAL_STRING;
          answerType = ANSWER_TYPE.MATH_INPUT;

          //create hint TODO
          hintBody = ``;

          //edit problemBody to show in math
          problemBody = `{${problemBody}}`;

          //edit solution to show in math
          solution = `{${solution.split("\n").join("}\n{")}}`;
          break;
      }
      break;
    case DIFFICULTY.HARD:
      problemTitle = PROBLEM_TITLE.FIND_VALUE_STN;
      problemBody = "";
      opt = randInt(1,3);
      switch (opt) {
        case 1:
          termNum = randInt(2,4);
          [{out: problemBody, baseList, nList, randList}] = genAddSubStn(termNum);
          [{ solution, solutionList }] = genSolutionAddSub(baseList, nList, randList);
          answerBody = solutionList[solutionList.length - 1];
          if (problemBody != solutionList[0]) {
            solution = problemBody + "\n" + solution;
          }
          answerForDisplay = answerBody.replace("*", "{*}");
          checkAnswerType = CHECK_ANSWER_TYPE.EQUAL_STRING;
          answerType = ANSWER_TYPE.MATH_INPUT;

          //create hint
          hintBody = `ทำให้เลขยกกำลังเท่ากันก่อน แล้วจึงนำเลขข้างหน้ามาบวกลบกัน`
          hintBody += `\nเช่น {3*10^[4] + 5.6*10^[6]}\n{= 3*10^[4] + 560*10[4]}\n{= 563*10[4]}\n{= 5.63*10^[6]}`;

          //edit problemBody to show in math
          problemBody = `{${problemBody}}`;

          //edit solution to show in math
          solution = `{${solution.split("\n").join("}\n{")}}`;
          break;
        case 2: //add sub div equalDegree top buttom
          answer = randInt(1,50,true);
          buttom =  randInt(2,10);
          top = math.multiply(bignumber(answer),math.bignumber(buttom));
          termNum = randInt(2,4);
          //gen top
          baseList = [];
          nList = [];
          randList = [];
          baseList2 = [];
          nList2 = [];
          randList2 = [];
          baseOut = 0;
          n = randInt(3, 10, true);
          for (i = 0; i<termNum; i++) {
            if (i == termNum-1) {
              a = top - baseOut;
            } else {
              do {
                a = randInt(1,Math.abs(top),true);
              } while (baseOut + a == top);
            }
            if (a < 0) {
              baseList.push(-a);
              randList.push(0);
            } else {
              baseList.push(a);
              randList.push(1);
            }
            nList.push(n);
            baseOut += a;
            positiveBase = Math.abs(a);
            if (i==0) {
              problemBody += a<0 ? `-${stnString2(positiveBase,n)}` : `${stnString2(positiveBase,n)}`;
            } else {
              problemBody += a<0 ? `-${stnString2(positiveBase,n)}`: `+${stnString2(positiveBase,n)}`;
            }
          }

          //gen buttom
          temp = "";
          baseOut = 0;
          n2 = randInt(3, 10, true);
          for (i = 0; i<termNum; i++) {
            if (i == termNum-1) {
              a = buttom - baseOut;
            } else {
              do {
                a = randInt(1,Math.abs(buttom),true);
              } while (baseOut + a == buttom);
            }
            if (a < 0) {
              baseList2.push(-a);
              randList2.push(0);
            } else {
              baseList2.push(a);
              randList2.push(1);
            }
            nList2.push(n2);
            baseOut += a;
            positiveBase = Math.abs(a);
            if (i==0) {
              temp += a<0 ? `-${stnString2(positiveBase,n2)}` : `${stnString2(positiveBase,n2)}`;
            } else {
              temp += a<0 ? `-${stnString2(positiveBase,n2)}`: `+${stnString2(positiveBase,n2)}`;
            }
          }
          problemBody = `(${problemBody})/(${temp})`;
          [{ solution, solutionList }] = genSolutionAddSubDiv(baseList,nList,randList,baseList2,nList2,randList2);
          if (solutionList[0] != problemBody) {
            solution = problemBody + "\n" + solution;
          }
          answerBody = solutionList[solutionList.length-1];
          answerForDisplay = answerBody.replace("*10","{*10}");
          checkAnswerType = CHECK_ANSWER_TYPE.EQUAL_STRING;
          answerType = ANSWER_TYPE.MATH_INPUT;
          hintBody = `ถ้าเลขยกกำลังของ {10} เท่ากันแล้ว สามารถนำเลขข้างหน้า {10} มาบวกลบกันได้ จากนั้นค่อยนำเลขมาหารกัน แล้วจัดให้อยู่ในรูปสัญกรณ์วิทยาศาสตร์`;

          //edit problemBody to show in math
          problemBody = `{${problemBody}}`;

          //edit solution to show in math
          solution = `{${solution.split("\n").join("}\n{")}}`;
          break;
        case 3: //add sub div non-equalDegree top buttom
          answer = randInt(1,50,true);
          buttom =  randInt(2,10);
          top = math.multiply(bignumber(answer),math.bignumber(buttom));
          termNum = randInt(2,4);
          //gen top
          baseList = [];
          nList = [];
          randList = [];
          baseList2 = [];
          nList2 = [];
          randList2 = [];
          baseOut = 0;
          n = randInt(3, 10, true);
          for (i = 0; i<termNum; i++) {
            if (i == termNum-1) {
              a = top - baseOut;
            } else {
              do {
                a = randInt(1,Math.abs(top),true);
              } while (baseOut + a == top);
            }
            positiveBase = Math.abs(a);
            rand = randInt(1,3,true);
            positiveBase = moveThePoint(positiveBase,rand);
            baseList.push(positiveBase);
            randList.push(a<0? 0 : 1 );
            nList.push(n-rand);
            baseOut += a;
            if (i==0) {
              problemBody += a<0? `-${stnString2(positiveBase,n-rand)}`:`${stnString2(positiveBase,n-rand)}`;
            } else {
              problemBody += a<0 ? `-${stnString2(positiveBase,n-rand)}`: `+${stnString2(positiveBase,n-rand)}`;
            }
          }

          //gen buttom
          temp = "";
          baseOut = 0;
          n2 = randInt(3, 10, true);
          for (i = 0; i<termNum; i++) {
            if (i == termNum-1) {
              a = buttom - baseOut;
            } else {
              do {
                a = randInt(1,Math.abs(buttom),true);
              } while (baseOut + a == buttom);
            }
            positiveBase = Math.abs(a);
            rand = randInt(1,3,true);
            positiveBase = moveThePoint(positiveBase,rand);
            baseList2.push(positiveBase);
            randList2.push(a<0? 0 : 1 );
            nList2.push(n2-rand);
            baseOut += a;
            if (i==0) {
              temp += a<0? `-${stnString2(positiveBase,n2-rand)}`:`${stnString2(positiveBase,n2-rand)}`;
            } else {
              temp += a<0 ? `-${stnString2(positiveBase,n2-rand)}`: `+${stnString2(positiveBase,n2-rand)}`;
            }
          }
          problemBody = `(${problemBody})/(${temp})`;
          [{ solution, solutionList }] = genSolutionAddSubDiv(baseList,nList,randList,baseList2,nList2,randList2);
          if (solutionList[0] != problemBody) {
            solution = problemBody + "\n" + solution;
          }
          answerBody = solutionList[solutionList.length-1];
          answerForDisplay = answerBody.replace("*10","{*10}");
          checkAnswerType = CHECK_ANSWER_TYPE.EQUAL_STRING;
          answerType = ANSWER_TYPE.MATH_INPUT;
          hintBody = `ทำให้เลขยกกำลังของ {10} เท่ากันก่อน แล้วจึงนำเลขข้างหน้า {10} มาบวกลบกัน จากนั้นค่อยนำเลขมาหารกัน แล้วจัดให้อยู่ในรูปสัญกรณ์วิทยาศาสตร์`;

          //edit problemBody to show in math
          problemBody = `{${problemBody}}`;

          //edit solution to show in math
          solution = `{${solution.split("\n").join("}\n{")}}`;
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
    answerBody: answerBody,
    solution: solution,
    checkAnswerType: checkAnswerType,
    answerForDisplay: answerForDisplay,
    hintBody: hintBody,
  });
  
  // save to database
  try {
    newProblem = await problem.save();
    return newProblem;
  } catch (err) {
    console.log(err)
    return err;
  }
};

module.exports = { generateScientificNotation };