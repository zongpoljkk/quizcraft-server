const Problem = require("../../models/Problem");
const Answer = require("../../models/Answer");
const Hint = require("../../models/Hint");
const EASY = "EASY";
const MEDIUM = "MEDIUM";
const HARD = "HARD";
const alphabet = "abcdefghijklmnopqrstuvwxyz";

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

const generateScientificNotation = async (subtopicName, difficulty) => {
  var problemTitle,problemBody,answerBody,hintBody,solution;
  var a,n,stn,num,opt,nn,ff;
  let i;
  let problem, problemId, answer, hint, newProblem,newAnswer,newHint;
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
      return "Not Implement";
    case HARD:
      return "Not Implement";
  }
};

module.exports = {generateScientificNotation};

