const { min } = require("mathjs");
const math = require("mathjs");

const moveThePoint = (a, n) => {
  let out;
  a = String(a);
  let i;
  pointIndex = a.indexOf(".");
  if (pointIndex < 0) pointIndex = a.length;
  out = a.replace(".", "");
  if (n > 0) {
    if (pointIndex + n >= out.length) {
      old = out.length;
      for (i = 0; i < pointIndex + n - old; i++) {
        out += "0";
      }
    } else {
      out =
        out.substring(0, pointIndex + n) +
        "." +
        out.substring(pointIndex + n, out.length);
    }
  } else {
    if (pointIndex + n <= 0) {
      old = out.length;
      for (i = 0; i < 0 - (pointIndex + n) + 1; i++) {
        out = "0" + out;
      }
      out = out.substring(0, 1) + "." + out.substring(1, out.length);
    } else {
      out =
        out.substring(0, pointIndex + n) +
        "." +
        out.substring(pointIndex + n, out.length);
    }
  }
  if (out.indexOf(".") < 0 && out[0] == 0) {
    for (i in out) {
      if (out[0] == 0) {
        out = out.substring(1, out.length);
      } else break;
    }
  }
  if (out[0] == 0 && out.indexOf(".") != 1) {
    old = out.indexOf(".");
    for (i = 0; i < old - 1; i++) {
      out = out.substring(1, out.length);
    }
  }
  if (out.indexOf(".") >= 0 && out[out.length - 1] == 0) {
    do {
      out = out.substring(0, out.length - 1);
    } while (out[out.length - 1] == 0);
    if (out[out.length - 1] == ".") {
      out = out.substring(0, out.length - 1);
    }
  }
  return out;
};

const genAddSubStn = (termNum, m) => {
  let baseList = [],
    nList = [];
  let randList = Array.from({ length: termNum }, () =>
    Math.floor(Math.random() * 2)
  );
  let out = "";
  if (m == null) {
    m = randInt(4, 13, true);
  }
  for (i = 0; i < termNum; i++) {
    let nn = randInt(1, 9);
    let ff = String(randInt(1, 99));
    if (ff[ff.length - 1] == 0) {
      for (i in ff) {
        if (ff[ff.length - 1] == 0) ff = ff.substring(0, ff.length - 1);
      }
    }
    let a = `${nn}.${ff}`;
    let n = m + randInt(1, 3);
    let stn = `${a}*10^[${n}]`;
    baseList.push(a);
    nList.push(n);
    if (i == 0) {
      out += randList[i] ? `${stn}` : `-${stn}`;
    } else {
      out += randList[i] ? `+${stn}` : `-${stn}`;
    }
  }
  return [{ out, baseList, nList, randList }];
};

const getStn = (a, n) => {
  let positiveBase = Math.abs(a);
  let out = "";
  if (1 <= positiveBase && positiveBase < 10) {
    out = `${a}*10^[${n}]`;
  } else {
    if (positiveBase < 1) {
      //goRight
      do {
        positiveBase = moveThePoint(positiveBase, 1);
        n -= 1;
      } while (positiveBase < 1);
      out = a < 0 ? `-${positiveBase}*10^[${n}]` : `${positiveBase}*10^[${n}]`;
    } else if (positiveBase >= 10) {
      //goLeft
      do {
        positiveBase = moveThePoint(positiveBase, -1);
        n += 1;
      } while (positiveBase >= 10);
      out = a < 0 ? `-${positiveBase}*10^[${n}]` : `${positiveBase}*10^[${n}]`;
    }
  }
  return out;
};

const stnString = (a, n) => {
  return `${a}*10^[${n}]`;
};

const genSolution = (baseList, nList, randList) => {
  let baseOut = 0;
  let i, stn, step1, step2, step3, answer;
  let solution = "";
  let solutionList = [];
  let temp = "";
  //step1 make n to equal
  let min = Math.min(...nList);
  step1 = "";
  step2 = "";
  for (i in baseList) {
    if (nList[i] != min) {
      temp = moveThePoint(baseList[i], nList[i] - min);
      baseList[i] = temp;
      nList[i] = min;
    } else {
      temp = baseList[i];
    }
    stn = `${temp}*10^[${min}]`;
    if (i == 0) {
      step1 += randList[i] ? `${stn}` : `-${stn}`;
      step2 += randList[i] ? `${temp}` : `-${temp}`;
    } else {
      step1 += randList[i] ? `+${stn}` : `-${stn}`;
      step2 += randList[i] ? `+${temp}` : `-${temp}`;
    }
    baseOut = math.add(
      baseOut,
      randList[i] ? math.bignumber(temp) : math.bignumber(-temp)
    );
  }
  step2 = stnString(`(${step2})`, min);
  step3 = stnString(baseOut, min);
  solutionList.push(step1);
  solutionList.push(step2);
  solutionList.push(step3);
  answer = getStn(baseOut, min);
  if (solutionList[solutionList.length - 1] != answer) {
    solutionList.push(answer);
  }
  solution = solutionList.join("\n");
  return [{ solution, solutionList }];
};

const randFloat = (precision) => {
  if (precision) {
    return Math.floor(Math.random() * (10 * precision - 1 * precision) + 1 * precision) / (1*precision);
  }
  return Math.floor(Math.random() * (1000 - 100) + 100) / 100;
};

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

module.exports = {
  moveThePoint,
  genAddSubStn,
  getStn,
  stnString,
  genSolution,
  randFloat,
  multipleConcat,
};
