const Problem = require("../../models/Problem");
const Answer = require("../../models/Answer");
const Hint = require("../../models/Hint");
const math = require("mathjs");
const EASY = "EASY";
const MEDIUM = "MEDIUM";
const HARD = "HARD";
const alphabet = "abcdefghijklmnopqrstuvwxyz";
const SELECT_ONE = "SELECT_ONE";
const RADIO_CHOICE = "RADIO_CHOICE";
const MATH_INPUT = "MATH_INPUT";

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

const generateMeaningOfExponents = async (subtopicName, difficulty) => {
  var problemTitle,problemBody,answerBody,hintBody,solution, answerType;
  var expo, num,a ,n, rand, positiveBase, opt;
  let i;
  switch (difficulty) {
    case EASY:
      // problemTitle = `จงหาว่าเลขยกกำลังต่อไปนี้แทนจำนวนใด`;
      // a = randInt(1,40,true);
      // positiveBase = Math.abs(a);
      
      // if (1 <= positiveBase && positiveBase <= 10) {
      //   n = randInt(0,12);
      // }
      // else if (10 < positiveBase && positiveBase <= 20) {
      //   n = randInt(0,7);
      // }
      // else if (positiveBase > 20) {
      //   n = randInt(0,4); 
      // }
      // rand = randInt(0,1);
      // console.log(a);
      // console.log(n);
      // // rand = 1;
      // if (a < 0 && rand) {
      //   //-3^[4]
      //   expo = `${a}^[${n}]`;
      //   num = -1*math.pow(math.bignumber(positiveBase),math.bignumber(n));
      // }
      // else {
      //   expo = a<0? `(${a})^[${n}]`: `${a}^[${n}]`;
      //   num = math.pow(math.bignumber(a),math.bignumber(n));
      // }
      // opt = randInt(1,3);
      opt = 1;
      switch (opt) {
        case 1:
          problemTitle = `จงหาว่าเลขยกกำลังต่อไปนี้แทนจำนวนใด`;
          a = randInt(1,40,true);
          positiveBase = Math.abs(a);
          
          if (1 <= positiveBase && positiveBase <= 10) {
            n = randInt(0,12);
          }
          else if (10 < positiveBase && positiveBase <= 20) {
            n = randInt(0,5);
          }
          else if (positiveBase > 20) {
            n = randInt(0,4); 
          }
          rand = randInt(0,1);
          if (a < 0 && rand) {
            //ex -3^[4]
            expo = `${a}^[${n}]`;
            num = -1*math.pow(math.bignumber(positiveBase),math.bignumber(n));
          }
          else {
            expo = a<0? `(${a})^[${n}]`: `${a}^[${n}]`;
            num = math.pow(math.bignumber(a),math.bignumber(n));
          }
          problemBody = `${expo}`;
          answerBody = `${num}`;
          solution = "";
          let bool = a < 0 && rand; //ex -3^[4] ?
          for (i=0 ;i<n; i++) {
            if (bool) {
              solution += i == 0? `${positiveBase}` : `*${positiveBase}`
            } else {
              if (i == 0) {
                solution += a<0? `(${a})` : `${a}`;
              } else {
                solution += a<0? `*(${a})` : `*${a}`;
              }
            }
            if (i == n-1 && bool) solution = `-(${solution})`;
          }
          if (n !=1 ) {
            solution += n == 0? `${bool? `-(1)\n${answerBody}`: `${answerBody}`}` : `\n${answerBody}`;
          }
          hintBody = "a^n = a*a*a*... --> a คูณกัน n ตัว";
          if (n == 0) hintBody += "\na^0 = 1 เมื่อ a ไม่เท่ากับ 0";
          break;
        case 2: 
          problemTitle = "จงเขียนผลคูณต่อไปนี้ในรูปเลขยกกำลัง"
          break;
      }
      console.log("problemTitle",problemTitle);
      console.log("problemBody",problemBody);
      console.log("answerBody",answerBody);
      console.log("solution",solution);
      console.log("hintBody",hintBody)
      return "Not Implement";
    case MEDIUM:
      return "Not Implement";
    case HARD:
      return "Not Implement";
  }
};

// generateMeaningOfExponents('ความหมายของเลขยกกำลัง','EASY')
// return 0

module.exports = {generateMeaningOfExponents};

