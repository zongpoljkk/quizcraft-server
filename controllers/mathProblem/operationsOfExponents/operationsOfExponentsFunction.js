const { ALPHABET } = require("../../../utils/const");
const { randInt } = require("../globalFunction");

const multipleConcat = (base, degree, i) => {
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

const multipleExponentialString = (baseList, degreeList) => {
  let out = "";
  let i;
  for (i = 0; i < baseList.length; i++) {
    if (i == 0) {
      if (degreeList[i] == 1) {
      }
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

const genSolution = (baseList, degreeList, baseList2, degreeList2) => {
  //FYI: can combine only same base, can't combine (-3)*[4]*(3)*[4]
  let out, top, buttom, step1, step2, step3, step4;
  let index, base, degree, degree2;
  out = top = buttom = step1 = step2 = step3 = step4 = "";
  let baseListTop = [];
  let baseListButtom = [];
  let degreeListTop = [];
  let degreeListButtom = [];
  let baseListOut = [];
  let degreeListOut = [];
  let outList = [];
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
  if (step1 != outList[outList.length-1]) {
    out += step1;
    outList.push(step1);
  }

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
  if (step2 != outList[outList.length-1]) {
    out += `\n${step2}`;
    outList.push(step2);
  }

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
          top += multipleConcat(base, degree, i);
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
          top += multipleConcat(base, degree, i);
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
        top += multipleConcat(base, degree * -1, 1);
        if (!baseListTemp.includes(base)) {
          baseListTemp.push(base);
          degreeListTemp.push(degree * -1);
        }
      }
    });
    step3 = top;
    if (step3 != outList[outList.length-1]) {
      out += `\n${step3}`;
      outList.push(step3);
    }

    step4 = multipleExponentialString(baseListTemp, degreeListTemp);
    if (step4 != outList[outList.length-1]) {
      out += `\n${step4}`;
      outList.push(step4);
    }
    baseListOut = baseListTemp;
    degreeListOut = degreeListTemp;
  }
  return [{ solution: out, solutionList: outList, baseListOut, degreeListOut }];
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

const baseSelectorNoInt = () => {
  let rand = randInt(1,3); //choose base
  let a, b, c;
  switch (rand) {
    case 1: //float
      a =
        (Math.random() * 9 + 1.01).toFixed(2) *
        (-1) ** Math.floor(Math.random() * 2); //random (+-)[1.01,10.00)
      break;
    case 2: //fraction
      b = randInt(1, 10, true); //random (+-)[1,10]
      c = randInt(2, 10, false); //random [2,10]
      c = c == b ? c + 1 : c;
      a = `(${b}/${c})`;
      break;
    case 3: //alphabet
      a = ALPHABET[randInt(0,ALPHABET.length-1)];
      break;
  }
  return a;
};

module.exports = { 
  multipleConcat, 
  multipleExponentialString, 
  plusDegreeString,
  minusDegreeString,
  genSolution,
  diverse,
  baseSelectorNoInt,
};
