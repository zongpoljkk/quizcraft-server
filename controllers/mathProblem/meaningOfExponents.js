const Problem = require("../../models/Problem");
const Answer = require("../../models/Answer");
const Hint = require("../../models/Hint");
const math = require("mathjs");
const { randInt } = require("./globalFunction");
const {
  EASY,
  MEDIUM,
  HARD,
  alphabet,
  SELECT_ONE,
  RADIO_CHOICE,
  MATH_INPUT
} = require("./const");

const generateMeaningOfExponents = async (subtopicName, difficulty) => {
  var problemTitle,problemBody,answerBody,hintBody,solution, answerType;
  var expo, num,a ,n, rand, positiveBase, opt, selectedExpo, expoList, numList, choices;
  let problem, problemId, answer, hint, newProblem,newAnswer,newHint;
  let i;
  switch (difficulty) {
    case EASY:
      opt = randInt(1,3);
      switch (opt) {
        case 1:
          problemTitle = `จงหาว่าเลขยกกำลังต่อไปนี้แทนจำนวนใด`;
          a = randInt(1,30,true);
          positiveBase = Math.abs(a);
          if (1 <= positiveBase && positiveBase <= 2) {
            n = randInt(0,10);
          }
          else if (2 < positiveBase && positiveBase <= 5) {
            n = randInt(0,4);
          }
          else if (5 < positiveBase && positiveBase <= 11) {
            n = randInt(0,3);
          }
          else if (11 < positiveBase) {
            n = randInt(0,2);
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
          answerType = randInt(0,1)? MATH_INPUT : RADIO_CHOICE;
          if(answerType == RADIO_CHOICE) {
            //gen list of choices
          }
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
          hintBody = "a^[n] = a*a*a*... --> a คูณกัน n ตัว\nเช่น 3^[4] = 3*3*3*3";
          if (n == 0) hintBody += "\na^[0] = 1 เมื่อ a ไม่เท่ากับ 0";
          break;
        case 2: 
          problemTitle = "จงเขียนผลคูณต่อไปนี้ในรูปเลขยกกำลัง"
          a = randInt(0,1)? randInt(1,1000,true) : alphabet[randInt(0,alphabet.length)];
          n = randInt(2,7);
          problemBody = "";
          for (i=0; i<n; i++) {
            if (i==0) {
              problemBody += a<0? `(${a})` : `${a}`;
            } else {
              problemBody += a<0? `*(${a})` : `*${a}`;
            }
          }
          answerBody = a<0? `(${a})^[${n}]` : `${a}^[${n}]`;
          answerType = MATH_INPUT;
          hintBody = "a*a*a = a^3";
          solution = answerBody;
          break;
        case 3:
          problemTitle = "จงหาว่าเลขยกกำลังต่อไปนี้มีค่าเท่ากันหรือไม่"
          let indexList;
          a = randInt(1,500);
          n = randInt(0,15);
          indexList = [];
          expoList = []; 
          numList = [];
          expoList.push(`${a}^[${n}]`); // 3^[2]
          numList.push(1);
          expoList.push(`(-${a})^[${n}]`); //(-3)^[2]
          if (n % 2 == 0) {
            numList.push(1);
          } else {
            numList.push(-1)
          }
          expoList.push(`-${a}^[${n}]`); // -3^[2]
          numList.push(-1);
          selectedExpo = [];
          do {
            rand = randInt(0,expoList.length-1);
            expo = expoList[rand];
            if (!selectedExpo.includes(expo)) {
              selectedExpo.push(expo);
              indexList.push(rand);
            }
          } while (selectedExpo.length < 2);

          problemBody = `${selectedExpo[0]} และ ${selectedExpo[1]}`
          //create answer
          answerBody = numList[indexList[0]] == numList[indexList[1]] ? "เท่ากัน" : "ไม่เท่า";
          answerType = RADIO_CHOICE;
          choices = ["เท่ากัน","ไม่เท่า"]
          solution = `${selectedExpo[0]} มีค่าเป็น${numList[indexList[0]]==1? `บวก`:`ลบ`} `
                    + `${answerBody==`เท่ากัน`? `และ`:`ในขณะที่`} `
                    +`${selectedExpo[1]} ${answerBody==`เท่ากัน`? `ก็`:``}มีค่าเป็น`
                    +`${numList[indexList[1]]==1? `บวก`:`ลบ`}${answerBody==`เท่ากัน`? `เช่นเดียวกัน`:``}`;
                    
          //create hint
          hintBody = `ถ้าเลขติดลบยกกำลังด้วยเลขคู่จะได้ค่าบวก`
                    +`\nถ้าเลขติดลบยกกำลังด้วยเลขคี่จะได้ค่าลบ`
                    +`\n(-${a})^[2] = (-${a})*(-${a}) แต่ -${a}^[2] = -(${a}*${a})`;
          break;
        
      }
      // create model
      problem = new Problem({
        body: problemBody,
        subtopicName: subtopicName,
        difficulty: difficulty,
        answerType: answerType,
        title: problemTitle,
        choices: answerType == RADIO_CHOICE? choices : [],
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

module.exports = {generateMeaningOfExponents};

