const Problem = require("../models/Problem");
const Answer = require("../models/Answer");
const Hint = require("../models/Hint");
const EASY = "EASY";
const MEDIUM = "MEDIUM";
const HARD = "HARD";
const alphabet = "abcdefghijklmnopqrstuvwxyz";

const mathGenerate = ({ subtopicName, difficulty }) => {
  switch (subtopicName) {
    case "ความหมายของเลขยกกำลัง":
      return "Not Implement";
    case "การดำเนินการของเลขยกกำลัง":
      return genarateSubtopic2(subtopicName, difficulty);
    case "สัญกรณ์วิทยาศาสตร์":
      return genarateSubtopic3(subtopicName, difficulty);
    default:
      return "Hello";
  }
};

const baseSelector = () => {
  let rand = Math.floor(Math.random() * 4) + 1; //choose base
  let a, b, c;
  switch (rand) {
    case 1: //int
      a = randInt(2, 10, true); //random (+-)[2,10]
      break;
    case 2: //float
      a =
        (Math.random() * 9 + 1.01).toFixed(2) *
        (-1) ** Math.floor(Math.random() * 2); //random (+-)[1.01,10.00)
      break;
    case 3: //fraction
      b = randInt(1, 10, true); //random (+-)[1,10]
      c = randInt(2, 10, false); //random [2,10]
      c = c == b ? c + 1 : c;
      a = `(${b}/${c})`;
      break;
    case 4: //alphabet
      a = alphabet[Math.floor(Math.random() * alphabet.length)];
      break;
  }
  return a;
};

const concat = (base, i, degree) => {
  if (i == 0) {
    if (base < 0) {
      if (degree == 1) return `(${base})`;
      else return `(${base})^[${degree}]`;
    } else {
      if (degree == 1) return `${base}`;
      else return `${base}^[${degree}]`;
    }
  } else {
    if (base < 0) {
      if (degree == 1) return `*(${base})`;
      else return `*(${base})^[${degree}]`;
    } else {
      if (degree == 1) return `*${base}`;
      return `*${base}^[${degree}]`;
    }
  }
};

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

const diverse = (termNum) => {
  let randList = Array.from({ length: termNum }, () =>
    Math.floor(Math.random() * 2)
  );
  let sum = randList.reduce((a, b) => a + b, 0);
  if (sum == 0) {
    randList.push(1);
    termNum += 1;
  } else if (sum == termNum) {
    randList.push(0);
    termNum += 1;
  }
  return [{ randList, termNum }];
};

const plusDegreeString = (degreeList) => {
  let out;
  if (degreeList.length == 1) {
    out = `[${degreeList[0]}]`;
  } else {
    out = degreeList[0] < 0 ? `(${degreeList[0]})` : `${degreeList[0]}`;
    out += degreeList
      .slice(1, degreeList.length)
      .reduce(
        (prev, cur) => (cur < 0 ? prev + `+(${cur})` : prev + `+${cur}`),
        ""
      );
    out = `[(${out})]`;
  }
  return out;
};

const minusDegreeString = (degreeList) => {
  let out = degreeList[0] < 0 ? `(${degreeList[0]})` : `${degreeList[0]}`;
  out += degreeList
    .slice(1, degreeList.length)
    .reduce(
      (prev, cur) => (cur < 0 ? prev + `-(${cur})` : prev + `-${cur}`),
      ""
    );
  out = `[(${out})]`;
  return out;
};

const multipleExponentialString = (baseList, degreeList) => {
  let out = "";
  for (i = 0; i < baseList.length; i++) {
    if (i == 0) {
      out +=
        baseList[i] < 0
          ? `(${baseList[i]})^[${degreeList[i]}]`
          : `${baseList[i]}^[${degreeList[i]}]`;
    } else {
      out +=
        baseList[i] < 0
          ? `*(${baseList[i]})^[${degreeList[i]}]`
          : `*${baseList[i]}^[${degreeList[i]}]`;
    }
  }
  return out;
};

const genSolutionSubtopic2 = (baseList, degreeList, baseList2, degreeList2) => {
  //FYI: can combine only same base, can't combine (-3)*[4]*(3)*[4]
  let out = "";
  let step1 = "",
    top = "",
    buttom = "";
  let step2 = "",
    step3 = "",
    step4 = "";
  let baseListTop = [],
    baseListButtom = [];
  let degreeListTop = [],
    degreeListButtom = [];
  let baseListOut = [],
    degreeListOut = [];
  let index, base, degree, degree2;
  let indexList = [];
  // step1: combine with same base for top and buttom ex 2^[(2+1+(-5))]*3^[2]*(-3)*[((-2)+1)]
  for (i = 0; i < baseList.length; i++) {
    base = baseList[i];
    degree = degreeList[i];
    if (!baseListTop.includes(base)) {
      baseListTop.push(base);
      degreeListTop.push([degree]);
    } else {
      index = baseListTop.indexOf(base);
      degreeListTop[index].push(degree);
    }
  }
  for (i = 0; i < baseListTop.length; i++) {
    if (i == 0) {
      top +=
        baseListTop[i] < 0
          ? `(${baseListTop[i]})^${plusDegreeString(degreeListTop[i])}`
          : `${baseListTop[i]}^${plusDegreeString(degreeListTop[i])}`;
    } else {
      top +=
        baseListTop[i] < 0
          ? `*(${baseListTop[i]})^${plusDegreeString(degreeListTop[i])}`
          : `*${baseListTop[i]}^${plusDegreeString(degreeListTop[i])}`;
    }
  }
  step1 = top;
  if (degreeList2) {
    for (i = 0; i < baseList2.length; i++) {
      base = baseList2[i];
      degree = degreeList2[i];
      if (!baseListButtom.includes(base)) {
        baseListButtom.push(base);
        degreeListButtom.push([degree]);
      } else {
        index = baseListButtom.indexOf(base);
        degreeListButtom[index].push(degree);
      }
    }
    for (i = 0; i < baseListButtom.length; i++) {
      if (i == 0) {
        buttom +=
          baseListButtom[i] < 0
            ? `(${baseListButtom[i]})^${plusDegreeString(degreeListButtom[i])}`
            : `${baseListButtom[i]}^${plusDegreeString(degreeListButtom[i])}`;
      } else {
        buttom +=
          baseListButtom[i] < 0
            ? `*(${baseListButtom[i]})^${plusDegreeString(degreeListButtom[i])}`
            : `*${baseListButtom[i]}^${plusDegreeString(degreeListButtom[i])}`;
      }
    }
    step1 = `(${top})/(${buttom})`;
  }
  out += step1;
  // step2: combine with same base ex 2^[]*3[]*(-3)^[]
  //add degree
  degreeListTop.forEach((e, i) => {
    degreeListTop[i] = e.reduce((prev, cur) => prev + cur, 0);
  });
  top = multipleExponentialString(baseListTop, degreeListTop);
  baseListOut = baseListTop;
  degreeListOut = degreeListTop;
  if (baseList2) {
    degreeListButtom.forEach((e, i) => {
      degreeListButtom[i] = e.reduce((prev, cur) => prev + cur, 0);
    });
    buttom = multipleExponentialString(baseListButtom, degreeListButtom);
    step2 = `(${top})/(${buttom})`;
  } else {
    step2 = top;
  }
  out += `\n${step2}`;
  //step3: combine top and buttom ex 2^[(-2)-(-2)]*3^[2]*(-3)*[((-1)-2)]
  top = "";
  if (baseList2) {
    let mark = Array.from({ length: baseListButtom.length }, () => 0);
    let baseListTemp = [];
    let degreeListTemp = [];
    for (i = 0; i < baseListTop.length; i++) {
      base = baseListTop[i];
      degree = degreeListTop[i];
      if (i == 0) {
        if (baseListButtom.includes(base)) {
          index = baseListButtom.indexOf(base);
          mark[index] = 1;
          degree2 = degreeListButtom[index];
          top +=
            base < 0
              ? `(${base})^${minusDegreeString([degree, degree2])}`
              : `${base}^${minusDegreeString([degree, degree2])}`;
          if (!baseListTemp.includes(base)) {
            baseListTemp.push(base);
            degreeListTemp.push(degree - degree2);
          }
        } else {
          top += concat(base, i, degree);
          if (!baseListTemp.includes(base)) {
            baseListTemp.push(base);
            degreeListTemp.push(degree);
          }
        }
      } else {
        if (baseListButtom.includes(base)) {
          index = baseListButtom.indexOf(base);
          mark[index] = 1;
          degree2 = degreeListButtom[index];
          top +=
            base < 0
              ? `*(${base})^${minusDegreeString([degree, degree2])}`
              : `*${base}^${minusDegreeString([degree, degree2])}`;
          if (!baseListTemp.includes(base)) {
            baseListTemp.push(base);
            degreeListTemp.push(degree - degree2);
          }
        } else {
          top += concat(base, i, degree);
          if (!baseListTemp.includes(base)) {
            baseListTemp.push(base);
            degreeListTemp.push(degree);
          }
        }
      }
    }
    mark.forEach((e, i) => {
      if (!e) {
        base = baseListButtom[i];
        degree = degreeListButtom[i];
        top += concat(base, 1, degree * -1);
        if (!baseListTemp.includes(base)) {
          baseListTemp.push(base);
          degreeListTemp.push(degree * -1);
        }
      }
    });
    step3 = top;
    out += `\n${step3}`;
    step4 = multipleExponentialString(baseListTemp, degreeListTemp);
    out += `\n${step4}`;
    baseListOut = baseListTemp;
    degreeListOut = degreeListTemp;
  }
  return [out, baseListOut, degreeListOut];
};

const genarateSubtopic2 = async (subtopicName, difficulty) => {
  var termNum = randInt(2, 5, false); //random 2-5
  var problemBody = "";
  var answerBody;
  var hintBody;
  var solution = "",
    solutionButtom = "";
  var base, degree, randList, baseList, degreeList;
  var baseList2, degreeList2;
  var degreeSum = 0;
  var degreeOut = 0;
  var isDivided = randInt(0, 1, false); //0 or 1
  var buttom = "";
  var degreeSum2 = 0;
  let problem, problemId, answer, hint, newProblem,newAnswer,newHint;
  switch (difficulty) {
    case EASY:
      // create problem
      base = baseSelector();
      solution = base < 0 ? `(${base})^` : `${base}^`;
      degreeList = [];
      for (i = 0; i < termNum; i++) {
        degree = randInt(0, 50, true); // (+,-)[0,50]
        degreeList.push(degree);
        degreeSum += degree;
        problemBody += concat(base, i, degree);
      }
      solution += plusDegreeString(degreeList);
      if (isDivided) {
        termNum = randInt(1, 5, false); //random 1-5
        solutionButtom = base < 0 ? `(${base})^` : `${base}^`;
        degreeList2 = [];
        for (i = 0; i < termNum; i++) {
          degree = randInt(0, 50, true); // (+,-)[0,50]
          degreeList2.push(degree);
          degreeSum2 += degree;
          buttom += concat(base, i, degree);
        }
        solutionButtom += plusDegreeString(degreeList2);
        problemBody = `(${problemBody})/(${buttom})`;
        solution = `(${solution})/(${solutionButtom})`;
        solution +=
          base < 0
            ? `\n((${base})^[${degreeSum}])/((${base})^[${degreeSum2}])`
            : `\n(${base}^[${degreeSum}])/(${base}^[${degreeSum2}])`;
        solution +=
          base < 0
            ? `\n(${base})^${minusDegreeString([degreeSum, degreeSum2])}`
            : `\n${base}^${minusDegreeString([degreeSum, degreeSum2])}`;
        degreeSum -= degreeSum2;
      }
      // create answer
      answerBody =
        base < 0 ? `(${base})^[${degreeSum}]` : `${base}^[${degreeSum}]`;
      solution += `\n${answerBody}`;

      //create hint
      hintBody = `a^m*a^n = a^(m+n)|สมบัติการคูณของเลขยกกำลัง`;
      if (isDivided)
        hintBody += `\n(a^m)/(a^n) = a^(m-n)|สมบัติการหารของเลขยกกำลัง`;

      //create model
      problem = new Problem({
        body: problemBody,
        subtopicName: subtopicName,
        difficulty: difficulty,
        answerType: "MATH_INPUT",
      });
      problemId = problem._id;
      answer = new Answer({
        problemId: problemId,
        body: answerBody,
        solution: solution,
      });
      hint = new Hint({ problemId: problemId, body: hintBody });
      //save to database
      try{
        newProblem = await problem.save();
        newAnswer = await answer.save();
        newHint = await hint.save();
        return [{ problem:newProblem, answer:newAnswer, hint:newHint }];
      }catch (err) {
        console.log(err)
        return err;
      }

    case MEDIUM:
      // opt1=> 49*7^[2],  opt2 => (1/2)^2*(0.5)^[3],  opt3 => (-3)^2*(3)^2
      termNum = randInt(3, 6, false); //random 3-6
      let opt = randInt(1, 3, false); //1,2,3
      switch (opt) {
        case 1: //49*7^[2]
          base = randInt(2, 25, true); //random (+-)[2,25]
          [{ randList, termNum }] = diverse(termNum);
          degreeList = [];
          solution = "";
          for (i = 0; i < termNum; i++) {
            if (randList[i]) {
              degree = randInt(2, 5, false); //random [2,5]
            } else {
              degree = randInt(0, 50, true); // (+,-)[0,50]
            }
            degreeList.push(degree);
            degreeSum += degree;
            if (randList[i]) {
              problemBody += concat(base ** degree, i, 1);
            } else problemBody += concat(base, i, degree);

            solution += concat(base, i, degree);
          }

          if (isDivided) {
            termNum = randInt(1, 5, false); //random 1-5
            [{ randList, termNum }] = diverse(termNum);
            solutionButtom = "";
            degreeList2 = [];
            for (i = 0; i < termNum; i++) {
              if (randList[i]) {
                degree = randInt(2, 5, false); //random [2,5]
              } else {
                degree = randInt(0, 50, true); // (+,-)[0,50]
              }
              degreeList2.push(degree);
              degreeSum2 += degree;
              if (randList[i]) {
                buttom += concat(base ** degree, i, 1);
              } else buttom += concat(base, i, degree);

              solutionButtom += concat(base, i, degree);
            }
            solution = `(${solution})/(${solutionButtom})`;
            problemBody = `(${problemBody})/(${buttom})`;
            solution +=
              base < 0
                ? `\n((${base})^${plusDegreeString(
                    degreeList
                  )})/((${base})^${plusDegreeString(degreeList2)})`
                : `\n(${base}^${plusDegreeString(
                    degreeList
                  )})/(${base}^${plusDegreeString(degreeList2)})`;
            solution +=
              base < 0
                ? `\n((${base})^${plusDegreeString([
                    degreeSum,
                  ])})/((${base})^${plusDegreeString([degreeSum2])})`
                : `\n(${base}^${plusDegreeString([
                    degreeSum,
                  ])})/(${base}^${plusDegreeString([degreeSum2])})`;
            solution +=
              base < 0
                ? `\n(${base})^${minusDegreeString([degreeSum, degreeSum2])}`
                : `\n${base}^${minusDegreeString([degreeSum, degreeSum2])}`;
            degreeSum -= degreeSum2;
          } else {
            solution +=
              base < 0
                ? `\n(${base})^${plusDegreeString(degreeList)}`
                : `\n${base}^${plusDegreeString(degreeList)}`;
          }

          // create answer
          answerBody =
            base < 0 ? `(${base})^[${degreeSum}]` : `${base}^[${degreeSum}]`;
          solution += `\n${answerBody}`;

          //create hint
          hintBody = `ลองเปลี่ยนเลขธรรมดาให้เป็นเลขยกกำลังที่ฐานเท่ากับเลขยกกำลังตัวอื่นดูสิ\na^m*a^n = a^(m+n)|สมบัติการคูณของเลขยกกำลัง`;
          if (isDivided)
            hintBody += `\n(a^m)/(a^n) = a^(m-n)|สมบัติการหารของเลขยกกำลัง`;
          break;

        case 2: //(1/2)^2*(0.5)^[3]
          let bList = [2, 4, 5, 10, 20, 25, 50, 100];
          let b = bList[Math.floor(Math.random() * bList.length)];
          let a = randInt(1, 100, true); //random (+-)[1,100]
          let fraction = `(${a}/${b})`;
          let decimal = a / b;

          [{ randList, termNum }] = diverse(termNum);
          degreeList = [];
          baseList = [];
          for (i = 0; i < termNum; i++) {
            base = randList[i] ? fraction : decimal;
            baseList.push(base);
            degree = randInt(0, 50, true); // (+,-)[0,50]
            degreeList.push(degree);
            degreeSum += degree;
            problemBody += concat(base, i, degree);
          }
          degreeOut = degreeSum;

          if (isDivided) {
            termNum = randInt(1, 5, false); //random 1-5
            [{ randList, termNum }] = diverse(termNum);
            degreeList2 = [];
            baseList2 = [];
            for (i = 0; i < termNum; i++) {
              base = randList[i] ? fraction : decimal;
              baseList2.push(base);
              degree = randInt(0, 50, true); // (+,-)[0,50]
              degreeList2.push(degree);
              degreeSum2 += degree;
              buttom += concat(base, i, degree);
            }
            problemBody = `(${problemBody})/(${buttom})`;
            degreeOut = degreeSum - degreeSum2;
          }
          // create solution
          baseList = Array.from({ length: baseList.length }, () => base);
          if (isDivided) {
            baseList2 = Array.from({ length: baseList2.length }, () => base);
            solution = `(${multipleExponentialString(
              baseList,
              degreeList
            )})/(${multipleExponentialString(baseList2, degreeList2)})`;
            solution +=
              base < 0
                ? `\n((${base})^${plusDegreeString(
                    degreeList
                  )})/((${base})^${plusDegreeString(degreeList2)})`
                : `\n(${base}^${plusDegreeString(
                    degreeList
                  )})/(${base}^${plusDegreeString(degreeList2)})`;
            solution += `\n(${multipleExponentialString(
              [base],
              [degreeSum]
            )})/(${multipleExponentialString([base], [degreeSum2])})`;
            solution +=
              base < 0
                ? `\n(${base})^${minusDegreeString([degreeSum, degreeSum2])}`
                : `\n${base}^${minusDegreeString([degreeSum, degreeSum2])}`;
          } else {
            solution = `${multipleExponentialString(baseList, degreeList)}`;
            solution +=
              base < 0
                ? `\n(${base})^${plusDegreeString(degreeList)}`
                : `\n${base}^${plusDegreeString(degreeList)}`;
          }
          // create answer
          answerBody =
            base < 0 ? `(${base})^[${degreeOut}]` : `${base}^[${degreeOut}]`;
          solution += `\n${answerBody}`;

          //create hint
          hintBody = `ถ้าสังเกตดี ๆ เศษส่วนกับทศนิยมเท่ากันนะ\na^m*a^n = a^(m+n)|สมบัติการคูณของเลขยกกำลัง`;
          if (isDivided)
            hintBody += `\n(a^m)/(a^n) = a^(m-n)|สมบัติการหารของเลขยกกำลัง`;
          break;

        case 3: // (-3)^2*(3)^2
          let base1 = randInt(2, 25, false); //random [2,25]
          let base2 = -1 * base1; //(-base1)
          let isLessThanZero = 0;

          [{ randList, termNum }] = diverse(termNum);
          degreeList = [];
          baseList = [];
          for (i = 0; i < termNum; i++) {
            base = randList[i] ? base1 : base2;
            baseList.push(base);
            degree = randInt(0, 50, true); // (+,-)[0,50]
            degreeList.push(degree);
            if ((base < 0) & (degree % 2 != 0)) {
              //พจน์นี้ติดลบ
              isLessThanZero = isLessThanZero ? 0 : 1;
            }
            degreeSum += degree;
            problemBody += concat(base, i, degree);
          }

          if (isDivided) {
            termNum = randInt(1, 5, false); //random 1-5
            [{ randList, termNum }] = diverse(termNum);
            degreeList2 = [];
            baseList2 = [];
            for (i = 0; i < termNum; i++) {
              base = randList[i] ? base1 : base2;
              baseList2.push(base);
              degree = randInt(0, 50, true); // (+,-)[0,50]
              degreeList2.push(degree);
              if ((base < 0) & (degree % 2 != 0)) {
                //พจน์นี้ติดลบ
                isLessThanZero = isLessThanZero ? 0 : 1;
              }
              degreeSum2 += degree;
              buttom += concat(base, i, degree);
            }
            problemBody = `(${problemBody})/(${buttom})`;
            degreeSum -= degreeSum2;
          }
          //create solution
          if (isDivided) {
            [solution, baseList, degreeList] = genSolutionSubtopic2(
              baseList,
              degreeList,
              baseList2,
              degreeList2
            );
          } else {
            [solution, baseList, degreeList] = genSolutionSubtopic2(
              baseList,
              degreeList
            );
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
          solution += `\n${answerBody}`;

          //create hint
          hintBody = `ถ้าเลขติดลบยกกำลังด้วยเลขคู่จะกลายเป็นค่าบวกนะ เช่น (-3)^[2] = 9 = 3^[2]\nแต่ถ้าเลขติดลบยกกำลังด้วยเลขคี่จะกลายเป็นค่าลบนะ เช่น (-3)^[3] = -27 = -(3^[3])\na^m*a^n = a^(m+n)|สมบัติการคูณของเลขยกกำลัง`;
          if (isDivided)
            hintBody += `\n(a^m)/(a^n) = a^(m-n)|สมบัติการหารของเลขยกกำลัง`;
          break;
      }

      //create model
      problem = new Problem({
        body: problemBody,
        subtopicName: subtopicName,
        difficulty: difficulty,
        answerType: "MATH_INPUT",
      });
      problemId = problem._id;
      answer = new Answer({
        problemId: problemId,
        body: answerBody,
        solution: solution,
      });
      hint = new Hint({ problemId: problemId, body: hintBody });
      //save to database
      try{
        await problem.save();
        await answer.save();
        await hint.save();
        return [{ problem, answer, hint }];
      }catch (err) {
        console.log(err)
        return err;
      }

    case HARD:
      return "genarateTestSubtopic HARD";
    default:
      return "genarateTestSubtopic default";
  }
};

const genarateSubtopic3 = async (subtopicName, difficulty) => {
  switch (difficulty) {
    case EASY:
      return "Not Implement";
    case MEDIUM:
      return "Not Implement";
    case HARD:
      return "Not Implement";
  }
};

module.exports = { mathGenerate };
