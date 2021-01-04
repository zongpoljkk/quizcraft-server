const Problem = require("../../models/Problem");
const Answer = require("../../models/Answer");
const Hint = require("../../models/Hint");
const EASY = "EASY";
const MEDIUM = "MEDIUM";
const HARD = "HARD";
const alphabet = "abcdefghijklmnopqrstuvwxyz";
const math = require("mathjs");

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

const moveThePoint = (a,n) => {
  let out;
  a = String(a);
  let i;
  pointIndex = a.indexOf('.');
  if (pointIndex<0) pointIndex = a.length;
  out = a.replace('.','');
  if (n>0) {
    if (pointIndex+n >= out.length) {
      old = out.length
      for (i=0; i<pointIndex+n-old; i++) {
        out +='0';
      }
    } else {
      out = out.substring(0,pointIndex+n) + '.' + out.substring(pointIndex+n,out.length);
    }
  } else {
    if (pointIndex+n <= 0) {
      old = out.length;
      for (i=0; i<0-(pointIndex+n)+1; i++){
        out = '0' + out;
      }
      out = out.substring(0,1) + '.' + out.substring(1,out.length);
    } else {
      out = out.substring(0,pointIndex+n)+'.'+out.substring(pointIndex+n,out.length);
    }
  }
  if (out.indexOf('.') < 0 && out[0] == 0) {
    for(i in out) {
      if (out[0] == 0 ){
        out = out.substring(1,out.length)
      }
    }
  }
  if (out[0] == 0 && out.indexOf('.') != 1) {
    old = out.indexOf('.');
    for (i=0;i<old-1;i++) {
      out = out.substring(1,out.length);
    }
  }
  return out;
}

const genAddSubStn = (termNum, m) => {
  let baseList = [], nList = [];
  let randList = Array.from({ length: termNum }, () =>
    Math.floor(Math.random() * 2)
  );
  let out = ""
  if (m==null) {
    m = randInt(4,13,true);
  }
  for (i=0; i<termNum; i++) {
    let nn = randInt(1,9);
    let ff = String(randInt(1,99));
    if (ff[ff.length-1] == 0) {
      for(i in ff) {
        if(ff[ff.length-1] == 0) ff = ff.substring(0,ff.length-1);
      }
    }
    let a = `${nn}.${ff}`
    let n = m + randInt(1,3);
    let stn = `${a}*10^[${n}]`;
    baseList.push(a);
    nList.push(n);
    if (i==0) {
      out += randList[i]? `${stn}` : `-${stn}` ;
    } else {
      out += randList[i]? `+${stn}` : `-${stn}` ;
    }
  }
  return [{ out, baseList, nList, randList}];
}

const generateScientificNotation = async (subtopicName, difficulty) => {
  var problemTitle,problemBody,answerBody,hintBody,solution;
  var a,n,stn,num,opt,nn,ff;
  let i, m, min, baseOut, positiveBase;
  let problem, problemId, answer, hint, newProblem,newAnswer,newHint;
  var termNum;
  var baseList, nList, randList, temp;
  switch (difficulty) {
    case EASY:
      nn = randInt(1,9);
      ff = String(randInt(1,9999));
      if (ff[ff.length-1] == 0) {
        for(i in ff) {
          if(ff[ff.length-1] == 0) ff = ff.substring(0,ff.length-1);
        }
      }
      a = `${nn}.${ff}`
      n = randInt(1,13,true);
      stn = `${a}*10^[${n}]`;
      num = moveThePoint(a,n);
      opt = randInt(1,2);
      switch(opt) {
        case 1: 
          problemTitle = "จงเขียนจำนวนต่อไปนี้ให้อยู่ในรูปสัญกรณ์วิทยาศาสตร์"
          problemBody = num;
          answerBody = stn; 
          hintBody = `เขียนเลขให้อยู่ในรูป a*10^[n] โดยที่ 1 <= a < 10 \nเลื่อนจุดไปทาง${n<0? `ขวา ${-n} หน่วย`:`ซ้าย ${n} หน่วย`}`;
          solution = '';
          temp = num;
          absN = Math.abs(n);
          for (i=0; i<absN; i++) {
            temp = moveThePoint(temp,n<0? 1:-1);
            solution += i==0? `${temp}*10^[${n<0? -(i+1):(i+1)}]` : `\n${temp}*10^[${n<0? -(i+1):(i+1)}]`
          }
          break;
        case 2:
          problemTitle = "จงเขียนตัวเลขแทนจำนวนต่อไปนี้โดยไม่ใช้เลขยกกำลัง";
          problemBody = stn;
          answerBody = num;
          hintBody = `เลื่อนจุดไปทาง${n<0? `ซ้าย ${-n} หน่วย`:`ขวา ${n} หน่วย`}`
          solution = '';
          temp = a;
          absN = Math.abs(n);
          for (i=0; i<absN; i++) {
            temp = moveThePoint(temp,n<0? -1:1);
            if (absN-i-1 == 0) {
              solution += i==0? `${temp}` : `\n${temp}`;
            } else {
              solution += i==0? `${temp}*10^[${n<0? -(absN-i-1):(absN-i-1)}]` : `\n${temp}*10^[${n<0? -(absN-i-1):(absN-i-1)}]`;
            }
          }
          break;
      }
      //create model
      problem = new Problem({
        body: problemBody,
        subtopicName: subtopicName,
        difficulty: difficulty,
        answerType: "MATH_INPUT",
        title: problemTitle,
      });
      problemId = problem._id;
      answer = new Answer({
        problemId: problemId,
        body: answerBody,
        solution: solution,
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
    case MEDIUM:
      termNum = randInt(2, 5, false); //random 2-5
      baseList = [], nList = [];
      randList = Array.from({ length: termNum }, () =>
        Math.floor(Math.random() * 2)
      );
      problemTitle = "จงหาผลลัพธ์ของเลขต่อไปนี้ แล้วตอบในรูปสัญกรณ์วิทยาศาสตร์"
      problemBody = "";
      m = randInt(4,13,true);
      for (i=0; i<termNum; i++) {
        nn = randInt(1,9);
        ff = String(randInt(1,999));
        if (ff[ff.length-1] == 0) {
          for(i in ff) {
            if(ff[ff.length-1] == 0) ff = ff.substring(0,ff.length-1);
          }
        }
        a = `${nn}.${ff}`
        n = m + randInt(1,3,true);
        stn = `${a}*10^[${n}]`;
        baseList.push(a);
        nList.push(n);
        if (i==0) {
          problemBody += randList[i]? `${stn}` : `-${stn}` ;
        } else {
          problemBody += randList[i]? `+${stn}` : `-${stn}` ;
        }
      }
      min = Math.min(...nList);
      solution = "";
      baseOut = 0;
      for (i in baseList) {
        temp = moveThePoint(baseList[i],nList[i]-min);
        baseList[i] = temp;
        nList[i] = min;
        stn = `${temp}*10^[${min}]`
        if (i==0) {
          solution += randList[i]? `${stn}` : `-${stn}` ;
        } else {
          solution += randList[i]? `+${stn}` : `-${stn}` ;
        }
        baseOut = math.add(baseOut,randList[i]? math.bignumber(temp) : math.bignumber(-temp))
      }
      solution += `\n${baseOut}*10^[${min}]`;
      positiveBase = Math.abs(baseOut)
      if (1<=positiveBase && positiveBase<10) {
        answerBody = `${baseOut}*10^[${min}]`;
      } 
      else {
        n = min;
        if (positiveBase<1) { 
          //goRight
          do {
            positiveBase = moveThePoint(positiveBase,1);
            n -= 1;
          } while (positiveBase<1);
          answerBody = baseOut<0? `-${positiveBase}*10^[${n}]` : `${positiveBase}*10^[${n}]`;
          solution += `\n${answerBody}`;

        } else if (positiveBase>=10) { 
          //goLeft
          do {
            positiveBase = moveThePoint(positiveBase,-1);
            n += 1
          } while (positiveBase>=10);
          answerBody = baseOut<0? `-${positiveBase}*10^[${n}]` : `${positiveBase}*10^[${n}]`;
          solution += `\n${answerBody}`;
        }
      }

      //create hint
      hintBody = `ทำให้เลขยกกำลังเท่ากันก่อน แล้วจึงนำเลขข้างหน้ามาบวกลบกัน\nเช่น 3*10^[4] + 5.6*10^[6]\n= 3*10^[4] + 560*10[4]\n= 563*10[4]\n= 5.63*10^[6]`;

      //create model
      problem = new Problem({
        body: problemBody,
        subtopicName: subtopicName,
        difficulty: difficulty,
        answerType: "MATH_INPUT",
        title: problemTitle,
      });
      problemId = problem._id;
      answer = new Answer({
        problemId: problemId,
        body: answerBody,
        solution: solution,
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
    case HARD:
      let out, minList;
      let listOfBaseList = [];
      let listOfNList = [];
      let listOfRandList = [];
      let isMul = randInt(0,1); 
      let isDiv = isMul? randInt(0,1) : 1;
      problemTitle = "จงหาผลลัพธ์ของเลขต่อไปนี้ แล้วตอบในรูปสัญกรณ์วิทยาศาสตร์โดยมีทศนิยมสองตำแหน่ง"
      problemBody = "";
      m = randInt(4,13,true);
      termNum = randInt(2, 3, false); //random 2-4
      [{out:problemBody, baseList, nList, randList}] = genAddSubStn(termNum,m);
      listOfBaseList.push(baseList);
      listOfNList.push(nList);
      listOfRandList.push(randList);
      minList = [Math.min(...nList)];
      if (isMul) {
        termNum = randInt(2, 3, false);
        [{out:temp, baseList, nList, randList}] = genAddSubStn(termNum,m);
        listOfBaseList.push(baseList);
        listOfNList.push(nList);
        listOfRandList.push(randList);
        minList.push(Math.min(...nList));
        problemBody = `(${problemBody})*(${temp})`
      }
      if (isDiv) {
        termNum = randInt(1, 3, false);
        [{out:temp, baseList, nList, randList}] = genAddSubStn(termNum,m);
        listOfBaseList.push(baseList);
        listOfNList.push(nList);
        listOfRandList.push(randList);
        minList.push(Math.min(...nList));
        problemBody = `(${problemBody})/(${temp})`
      }

      //create solution
      solution = "";
      let listOfBaseOut = []
      for (i in listOfBaseList) {
        out = "";
        baseOut = 0;
        min = minList[i]
        for (j in listOfBaseList[i]) {
          temp = moveThePoint(listOfBaseList[i][j], listOfNList[i][j]-min);
          listOfBaseList[i][j] = temp;
          listOfNList[i][j] = min;
          stn = `${temp}*10^[${min}]`;
          baseOut = math.add(baseOut,listOfRandList[i][j]? math.bignumber(temp) : math.bignumber(-temp));
          if (j==0) {
            out += listOfRandList[i][j]? `${stn}` : `-${stn}` ;
          } else {
            out += listOfRandList[i][j]? `+${stn}` : `-${stn}` ;
          }
        }
        listOfBaseOut.push(baseOut)
        if (i==0) {
          solution = out;
        } else if (i==1 && isMul) {
          solution = `(${solution})*(${out})`;
        } else if ((i==2) || (i==1 && isDiv) ) {
          solution = `(${solution})/(${out})`;
        }
      }
      temp ="";
      for (i in listOfBaseOut) {
        if (i==0) {
          temp = `${listOfBaseOut[i]}*10^[${minList[i]}]`;
        } else if (i==1 && isMul) {
          temp = `(${temp})*(${listOfBaseOut[i]}*10^[${minList[i]}])`;
        } else if ((i==2) || (i==1 && isDiv)) {
          temp = `(${temp})/(${listOfBaseOut[i]}*10^[${minList[i]}])`;
        }
      }
      solution += `\n${temp}`;
      if (listOfBaseOut.length == 2 && isMul) {
        baseOut = math.multiply(math.bignumber(listOfBaseOut[0]),math.bignumber(listOfBaseOut[1]));
        baseOut = math.round(baseOut,15);
        n = minList[0]+minList[1];
        temp = `${baseOut}*10^[${n}]`;
      } else if ((listOfBaseOut.length == 3) || (listOfBaseOut.length == 2 && isDiv)) {
        baseOut = listOfBaseOut.length == 3
                  ? math.divide(math.multiply(math.bignumber(listOfBaseOut[0]),math.bignumber(listOfBaseOut[1])), math.bignumber(listOfBaseOut[2]))
                  : math.divide(math.bignumber(listOfBaseOut[0]),math.bignumber(listOfBaseOut[1]));
        baseOut = math.round(baseOut,10);
        n = listOfBaseOut.length == 3
            ? minList[0]+minList[1]-minList[2]
            : minList[0]-minList[1];
        temp = `${baseOut}*10^[${n}]`;
      }
      solution += `\n${temp}`;
      positiveBase = Math.abs(baseOut)
      if (1<=positiveBase && positiveBase<10) {
        answerBody = `${math.round(baseOut,2)}*10^[${n}]`;
      } 
      else {
        if (positiveBase<1) { 
          //goRight
          do {
            positiveBase = moveThePoint(positiveBase,1);
            n -= 1;
          } while (positiveBase<1);
          answerBody = baseOut<0? `-${math.round(positiveBase,2)}*10^[${n}]` : `${math.round(positiveBase,2)}*10^[${n}]`;
          solution += `\n${answerBody}`;

        } else if (positiveBase>=10) { 
          //goLeft
          do {
            positiveBase = moveThePoint(positiveBase,-1);
            n += 1
          } while (positiveBase>=10);
          answerBody = baseOut<0? `-${math.round(positiveBase,2)}*10^[${n}]` : `${math.round(positiveBase,2)}*10^[${n}]`;
          solution += `\n${answerBody}`;
        }
      }

      //create hint
      hintBody = `ทำให้เลขยกกำลังของ 10 เท่ากันก่อน แล้วจึงนำเลขข้างหน้า 10 มาบวกลบกัน จากนั้นค่อยนำเลขมา${isMul? `คูณ`: ``}${isDiv? `หาร`:``}กัน แล้วจัดให้อยู่ในรูปสัญกรณ์วิทยาศาสตร์`;
      hintBody += `${isMul? `\na^m*a^n = a^(m+n) | สมบัติการคูณของเลขยกกำลัง`:``}`;
      hintBody += `${isDiv? `\n(a^m)/(a^n) = a^(m-n) | สมบัติการหารของเลขยกกำลัง`:``}`;
      
      //create model
      problem = new Problem({
        body: problemBody,
        subtopicName: subtopicName,
        difficulty: difficulty,
        answerType: "MATH_INPUT",
        title: problemTitle,
      });
      problemId = problem._id;
      answer = new Answer({
        problemId: problemId,
        body: answerBody,
        solution: solution,
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
  }
};

module.exports = {generateScientificNotation};

