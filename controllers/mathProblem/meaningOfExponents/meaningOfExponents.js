const Problem = require("../../../models/Problem");
const math = require("mathjs");
const { randInt, shuffle, baseSelector } = require("../globalFunction");
const { CHECK_ANSWER_TYPE, DIFFICULTY, ANSWER_TYPE, ALPHABET } = require("../../../utils/const");
const { bignumber } = require("mathjs");
const { multiplicationTerm } = require("./meaningOfExponentsFunction");

const generateMeaningOfExponents = async (subtopicName, difficulty) => {
  var problemTitle,problemBody,answerBody,hintBody,solution,answerType,answerForDisplay, checkAnswerType ;
  var expo, num,a ,n, rand, positiveBase, opt, selectedExpo, expoList, numList, choices;
  let problem, newProblem;
  let i,temp,primeList;
  switch (difficulty) {
    case DIFFICULTY.EASY:
      opt = await randInt(1,3);
      switch (opt) {
        case 1:  //3^[4] = 81
          problemTitle = `จงหาว่าเลขยกกำลังต่อไปนี้มีค่าเท่าใด`;
          a = await randInt(1,30,true);
          positiveBase = Math.abs(a);
          if (1 <= positiveBase && positiveBase <= 2) {
            n = await randInt(0,10);
          }
          else if (2 < positiveBase && positiveBase <= 5) {
            n = await randInt(0,4);
          }
          else if (5 < positiveBase && positiveBase <= 12) {
            n = await randInt(0,3);
          }
          else if (12 < positiveBase) {
            n = await randInt(0,2);
          }
          rand = await randInt(0,1);
          if (a < 0 && rand) {
            //ex -3^[4]
            expo = `${a}^[${n}]`;
            num = -1 * math.pow(math.bignumber(positiveBase),math.bignumber(n));
          }
          else {
            expo = a<0? `(${a})^[${n}]`: `${a}^[${n}]`;
            num = math.pow(math.bignumber(a),math.bignumber(n));
          }
          problemBody = `${expo}`;

          //create answer
          answerBody = `${num}`;
          answerForDisplay = answerBody;
          checkAnswerType = CHECK_ANSWER_TYPE.EQUAL_STRING;
          answerType = await randInt(0,1)? ANSWER_TYPE.MATH_INPUT : ANSWER_TYPE.RADIO_CHOICE;
          if(answerType == ANSWER_TYPE.RADIO_CHOICE) {
             //gen list of choices
            choices = [answerBody];
            temp = `${math.multiply(math.bignumber(a),math.bignumber(n))}`;
            if (!choices.includes(temp)) {
              choices.push(temp);
            }
            if (positiveBase < 10) {
              temp = `${math.pow(bignumber(n),bignumber(positiveBase))}`;
              if (!choices.includes(temp)) {
                choices.push(temp);
              }
            }
            if (n == 0) {
              temp = `${a}`;
              if (!choices.includes(temp)) {
                choices.push(temp);
              }
            }
            if (a < 0 && rand) { //-3^[4]
              temp = `${math.multiply(math.bignumber(positiveBase),math.bignumber(n))}`;
              if (!choices.includes(temp)) {
                choices.push(temp);
              }
              temp = `${answerBody*-1}`;
              if (!choices.includes(temp)) {
                choices.push(temp);
              }
            }
            while (choices.length < 4) {
              temp = `${math.multiply(math.bignumber(answerBody),await randInt(2,4))}`;
              if (!choices.includes(temp)) {
                choices.push(temp);
              }
            }
            choices = await shuffle(choices);
          }
          solution = `${problemBody}\n`;
          temp = "";
          let bool = a < 0 && rand; //ex -3^[4] ?
          for (i=0 ;i<n; i++) {
            if (bool) {
              temp += i == 0? `${positiveBase}` : `*${positiveBase}`
            } else {
              if (i == 0) {
                temp += a<0? `(${a})` : `${a}`;
              } else {
                temp += a<0? `*(${a})` : `*${a}`;
              }
            }
            if (i == n-1 && bool) temp = `-(${temp})`;
          }
          solution += temp;
          if (n !=1) {
            solution += n == 0? `${bool? `-(1)\n${answerBody}`: `${answerBody}`}` : `\n${answerBody}`;
          } else if ((n == 1 && bool) || n == 1 && a<0) {
            solution += `\n${answerBody}`;
          }

          //create hint
          hintBody = "a^[n] = a คูณกัน n ตัว\nเช่น 3^[4] = 3*3*3*3 -> 3 คูณกัน 4 ตัว";
          if (n == 0) hintBody += "\na^[0] = 1 เมื่อ a ไม่เท่ากับ 0 เช่น 3^[0] = 1";

          //edit solution (add =)
          solution = `= ${solution.split("\n").join("\n= ")}`;
          break;
        case 2: // 3*3*3*3 = 3^[4] or 3^[4] = 3*3*3*3
          rand = await randInt(0,1);
          problemTitle = rand? "จงเขียนเลขยกกำลังต่อไปนี้ในรูปผลคูณ โดยใช้เครื่องหมาย * แทนเครื่องหมายการคูณ" : "จงเขียนผลคูณต่อไปนี้ในรูปเลขยกกำลัง";
          if (rand) {
            a = await randInt(2,99,true);
            n = await randInt(2,5);
          } else {
            a = await randInt(0,1)? await randInt(2,99,true) : ALPHABET[await randInt(0,ALPHABET.length)];
            n = await randInt(2,7);
          }
          problemBody = await multiplicationTerm(a,n);

          //create answer
          answerBody = a<0? `(${a})^[${n}]` : `${a}^[${n}]`;
          if (rand) {
            [answerBody,problemBody] = [problemBody,answerBody];
          }
          answerForDisplay = answerBody;
          checkAnswerType = CHECK_ANSWER_TYPE.EQUAL_STRING;
          answerType = await randInt(0,1)? ANSWER_TYPE.MATH_INPUT : ANSWER_TYPE.RADIO_CHOICE;
          if (answerType == ANSWER_TYPE.RADIO_CHOICE && rand) {
            problemTitle = "จงเขียนเลขยกกำลังต่อไปนี้ในรูปผลคูณ";
          }
          if(answerType == ANSWER_TYPE.RADIO_CHOICE) {
            //gen list of choices
            choices = [answerBody];
            if (rand) {
              if (Math.abs(a) <= 7) {
                temp = await multiplicationTerm(n,Math.abs(a));
                if (!choices.includes(temp)) {
                  choices.push(temp);
                }
                temp = await multiplicationTerm(n, await randInt(1,Math.abs(a)+2));
                if (!choices.includes(temp)) {
                  choices.push(temp);
                }
              }
              do {
                temp = await multiplicationTerm(a, await randInt(n-1,n+2));
                if (!choices.includes(temp)) {
                  choices.push(temp);
                }
              } while (choices.length < 4);
            } else {
              temp = n<0? `(${n})^[${a}]` : `${n}^[${a}]`;
              if (!choices.includes(temp)) {
                choices.push(temp);
              }
              if (!ALPHABET.includes(a)) {
                temp = n<0? `(${n})^[${await randInt(a-1,a+2)}]` : `${n}^[${await randInt(a-1,a+2)}]`;
                if (!choices.includes(temp)) {
                  choices.push(temp);
                }
              } 
              do {
                temp = a<0? `(${a})^[${await randInt(n-1,n+2)}]` : `${a}^[${await randInt(n-1,n+2)}]`;
                if (!choices.includes(temp)) {
                  choices.push(temp);
                }
              } while (choices.length < 4);
            }
            choices = await shuffle(choices);
          }

          //create solution
          solution = `= ${problemBody}\n= ${a} คูณกัน ${n} ตัว\n= ${answerBody}`;

          //create hint
          hintBody = rand? "a^[n] = a คูณกัน n ตัว\nเช่น 3^[4] = 3*3*3*3 -> 3 คูณกัน 4 ตัว" 
                    : "a*a*a = a^[3]\n-> a คูณกันสามตัว เท่ากับ a ยกกำลัง 3";
          break;
        case 3: 
          a = await baseSelector();
          n = await randInt(0,99,true);
          rand = await randInt(0,1);
          problemTitle = rand? `จงบอก "ฐาน" ของเลขยกกำลังต่อไปนี้` : `จงบอก "เลขชี้กำลัง" ของเลขยกกำลังต่อไปนี้`;
          problemBody = a<0? `(${a})^[${n}]` : `${a}^[${n}]`;

          //create answer
          answerBody = rand? `${a}` : `${n}`;
          answerForDisplay = answerBody;
          checkAnswerType = CHECK_ANSWER_TYPE.EQUAL_STRING;
          answerType = await randInt(0,1)? ANSWER_TYPE.MATH_INPUT : ANSWER_TYPE.RADIO_CHOICE;
          if (answerType =  ANSWER_TYPE.RADIO_CHOICE) {
            choices = [a,n];
            choices = await shuffle(choices);
          }

          //create hint
          hintBody = "จาก a^[n]\nจะได้ว่า a คือ ฐาน และ n คือ เลขชี้กำลัง";
          break;
      }
      break;
    case DIFFICULTY.MEDIUM:
      opt = await randInt(1,3);
      switch (opt) {
        case 1:
          problemTitle = "จงหาค่าของ x เมื่อ";
          a = await randInt(2,25,true);
          positiveBase = Math.abs(a);
          if (1 <= positiveBase && positiveBase <= 2) {
            n = await randInt(3,10);
          } else if (2 < positiveBase && positiveBase <= 5) {
            n = await randInt(1,6);
          } else if (5 < positiveBase && positiveBase <= 10) {
            n = await randInt(0,5);
          } else if (10 < positiveBase && positiveBase <= 15) {
            n = await randInt(0,4);
          } else {
            n = await randInt(0,3);
          }
          expo = a<0? `(${a})^[x]`: `${a}^[x]`;
          num = math.pow(math.bignumber(a),math.bignumber(n));
          problemBody = `${expo} = ${num}`;

          //create answer
          answerBody = n;
          answerForDisplay = n;
          answerType = ANSWER_TYPE.MATH_INPUT;
          checkAnswerType = CHECK_ANSWER_TYPE.MATH_EVALUATE;
          
          //create hint 
          hintBody = `ถ้า a^[n] = a^[m] โดยที่ a ไม่เท่ากับ 0 จะได้ว่า n = m`;
          hintBody += `\nเช่น ถ้า 3^[x] = 81 = 3^[4] จะได้ว่า x = 4`;
          break;
        case 2:
          problemTitle = "จงเขียนจำนวนต่อไปนี้ ให้อยู่ในรูปเลขยกกำลังที่มีฐานเป็นจำนวนเฉพาะ"
          primeList = [2,3,5,7,11,13,17,19,23];
          a = primeList[await randInt(0,primeList.length-1)];
          positiveBase = Math.abs(a);
          if (2 <= positiveBase && positiveBase <= 3) { // 2 3
            n = await randInt(2,10);
          } else if (3 < positiveBase && positiveBase <= 6) { // 5 
            n = await randInt(2,6);
          } else if (6 < positiveBase && positiveBase <= 10) { // 7 
            n = await randInt(2,5);
          } else if (10 < positiveBase && positiveBase <= 15) { // 11 13
            n = await randInt(2,4);
          } else {
            n = await randInt(2,3);
          }
          expo = `(${a})^[${n}]`;
          num = math.pow(math.bignumber(a),math.bignumber(n));
          problemBody = num;
          
          //create answer
          answerBody = `${expo}`;
          answerForDisplay = `${expo}`;
          if (n%2 == 0) {
            answerBody += `|(${-a})^[${n}]`;
          }
          answerType = ANSWER_TYPE.MATH_INPUT;
          checkAnswerType = CHECK_ANSWER_TYPE.EQUAL_STRING;

          //create hint
          hintBody = "ลองแยกตัวประกอบของฐานให้อยู่ในรูปจำนวนเฉพาะคูณกัน เช่น ให้ a เป็นจำนวนเฉพาะใดๆ และ a*a*a = a^[3]"
          break;
        case 3:
          problemTitle = "จงเขียนจำนวนต่อไปนี้ให้อยู่ในรูปเลขยกกำลังที่มีเลขชี้กำลังมากกว่า 1";
          a = await randInt(2,25,true);
          positiveBase = Math.abs(a);
          if (positiveBase == 2) {
            n = await randInt(2,10);
          } else if (2 < positiveBase && positiveBase <= 5) {
            n = await randInt(2,6);
          } else if (5 < positiveBase && positiveBase <= 8) {
            n = await randInt(2,5);
          } else if (8 < positiveBase && positiveBase <= 11) {
            n = await randInt(2,4);
          } else {
            n = await randInt(2,3);;
          }
          if (a < 0 && n % 2 == 0) {
            a = -a;
          }
          expo = a<0? `(${a})^[${n}]` : `${a}^[${n}]`;
          num = math.pow(math.bignumber(a),math.bignumber(n));
          problemBody = num;
          
          //create answer
          answerBody = `${expo}`;
          answerForDisplay = `${expo}`;
          checkAnswerType = CHECK_ANSWER_TYPE.POWER_OVER_ONE;
          answerType = ANSWER_TYPE.MATH_INPUT;
          break;
      }
      break;
    case DIFFICULTY.HARD:
      opt = await randInt(1,3);
      switch (opt) {
        case 1:
          problemTitle = "จงหาว่าเลขยกกำลังต่อไปนี้มีค่าเท่ากันหรือไม่"
          let indexList;
          a = await randInt(1,500);
          n = await randInt(0,15);
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
            rand = await randInt(0,expoList.length-1);
            expo = expoList[rand];
            if (!selectedExpo.includes(expo)) {
              selectedExpo.push(expo);
              indexList.push(rand);
            }
          } while (selectedExpo.length < 2);

          problemBody = `${selectedExpo[0]} และ ${selectedExpo[1]}`
          //create answer
          answerBody = numList[indexList[0]] == numList[indexList[1]] ? "เท่ากัน" : "ไม่เท่า";
          answerType = ANSWER_TYPE.RADIO_CHOICE;
          answerForDisplay = answerBody;
          checkAnswerType = CHECK_ANSWER_TYPE.EQUAL_STRING;
          choices = ["เท่ากัน","ไม่เท่า"]
          solution = `${selectedExpo[0]} มีค่าเป็น${numList[indexList[0]]==1? `บวก`:`ลบ`} `
                    + `${answerBody==`เท่ากัน`? `และ`:`ในขณะที่`} `
                    +`${selectedExpo[1]} ${answerBody==`เท่ากัน`? `ก็`:``}มีค่าเป็น`
                    +`${numList[indexList[1]]==1? `บวก`:`ลบ`}${answerBody==`เท่ากัน`? `เช่นเดียวกัน`:``}`;
                    
          //create hint
          hintBody = `ถ้าจำนวนลบทั้งหมดยกกำลังด้วยเลขคู่จะได้ค่าเป็นบวก`
                    +`\nแต่ถ้าจำนวนลบทั้งหมดยกกำลังด้วยเลขคี่จะได้ค่าเป็นลบ`
                    +`\nเช่น (-${a})^[2] = (-${a})*(-${a}) และ (-${a})^[3] = (-${a})*(-${a})*(-${a}) แต่ -${a}^[2] = -(${a}*${a})`;
          break;
        case 2:
          problemTitle = "จงหาว่าเลขยกกำลังต่อไปนี้เป็นจำนวนเต็มประเภทใด";
          a = await randInt(1,500);
          n = await randInt(0,15);
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
          rand = await randInt(0,expoList.length-1);
          problemBody = expoList[rand];
          //create answer
          answerBody = numList[rand] == 1? "จำนวนเต็มบวก" : "จำนวนเต็มลบ";
          answerType = ANSWER_TYPE.RADIO_CHOICE;
          answerForDisplay = answerBody;
          checkAnswerType = CHECK_ANSWER_TYPE.EQUAL_STRING;
          choices = ["จำนวนเต็มบวก","จำนวนเต็มลบ"];
          //create hint
          hintBody = `ถ้าจำนวนลบทั้งหมดยกกำลังด้วยเลขคู่จะได้ค่าเป็นบวก`
                  +`\nแต่ถ้าจำนวนลบทั้งหมดยกกำลังด้วยเลขคี่จะได้ค่าเป็นลบ`
                  +`\nเช่น (-${a})^[2] = (-${a})*(-${a}) และ (-${a})^[3] = (-${a})*(-${a})*(-${a}) แต่ -${a}^[2] = -(${a}*${a})`;
          break;
        case 3:
          a = await randInt(2,50,true);
          positiveBase = Math.abs(a);
          if (1 <= positiveBase && positiveBase <= 2) {
            n = await randInt(4,10);
          } else if (2 < positiveBase && positiveBase <= 5) {
            n = await randInt(4,6);
          } else if (5 < positiveBase && positiveBase <= 10) {
            n = await randInt(2,4);
          } else if (10 < positiveBase) {
            n = await randInt(2,3);
          }
          expo = `x^[${n}]`;
          num = math.pow(math.bignumber(a),math.bignumber(n));
          problemBody = `${expo} = ${num}`;

          //create answer
          if (n%2 == 0) {
            problemTitle = `จงหาค่าของ x ที่เป็นจำนวนเต็ม${a<0? 'ลบ': 'บวก'}เมื่อ`;
          } else {
            problemTitle = `จงหาค่าของ x เมื่อ`;
          }
          answerBody = a;
          answerForDisplay = answerBody;
          answerType = ANSWER_TYPE.MATH_INPUT;
          checkAnswerType = CHECK_ANSWER_TYPE.MATH_EVALUATE;

          //create hint 
          hintBody = `ถ้า a^[n] = b^[n] โดยที่ n ไม่เท่ากับ 0 จะได้ว่า a = b`;
          hintBody += `\nเช่น ถ้า x^[4] = 81 = 3^[4] จะได้ว่า x = 3`;

          //crete solution
          solution = problemBody;
          if (n%2 == 0) {
            solution += `\n${expo} = ${Math.abs(a)}^[${n}]`;
          } else {
            solution += a<0? `\n${expo} = (${a})^[${n}]` : `\n${expo} = ${a}^[${n}]`;
          }
          solution += `\nx = ${answerForDisplay}`;
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

module.exports = {generateMeaningOfExponents};

