const Problem = require('../models/Problem');
const Answer = require('../models/Answer');
const Hint = require('../models/Hint');
const EASY = 'EASY';
const MEDIUM = 'MEDIUM';
const HARD = 'HARD';
const alphabet = "abcdefghijklmnopqrstuvwxyz"

const mathGenerate = ({subtopicName, difficulty}) => {
    switch(subtopicName) {
        case 'ความหมายของเลขยกกำลัง':
            return 'Not Implement';
        case 'การดำเนินการของเลขยกกำลัง':
            return genarateSubtopic2(subtopicName, difficulty);
        case 'สัญกรณ์วิทยาศาสตร์':
            return genarateSubtopic3(subtopicName, difficulty);
        default:
            return 'Hello';
    }
}

const baseSelector = () => {
    let rand = Math.floor(Math.random()*4)+1; //choose base
    let a,b,c;
    switch(rand){
        case 1: //int
            a = (Math.floor(Math.random() * 10) + 1)*(-1)**(Math.floor(Math.random() * 2)); //random (+-)[1,10]
            break;
        case 2: //float
            a = (((Math.random() * 9) + 1).toFixed(2))*(-1)**(Math.floor(Math.random() * 2)); //random (+-)[1.00,10.00)
            break;
        case 3: //fraction
            b = (Math.floor(Math.random() * 10) + 1)*(-1)**(Math.floor(Math.random() * 2)); //random (+-)[1,10]
            c = (Math.floor(Math.random() * 10) + 1); //random (+-)[1,10]
            a = `(${b}/${c})`;
            break;
        case 4: //alphabet
            a = alphabet[Math.floor(Math.random() * alphabet.length)];
            break;
    }
    return a;
}

const concat = (base, i, degree) => {
    if(i==0) {
        if(base<0) {
            if(degree==1) return `(${base})`;
            else return `(${base})^[${degree}]`;
        }else {
            if(degree==1) return `${base}`;
            else return `${base}^[${degree}]`;
        }
    }else {
        if(base<0) {
            if(degree==1) return `*(${base})`;
            else return `*(${base})^[${degree}]`;
        }else {
            if(degree==1) return `*${base}`;
            return `*${base}^[${degree}]`;
        }
    }  
}

const genarateSubtopic2 = async (subtopicName, difficulty) => {
    var termNum = Math.floor(Math.random() * 4) + 2; //random 2-5
    var problemBody = '';
    var answerBody;
    var hintBody;
    var base, degree;
    var degreeSum = 0;
    let isDivided = Math.floor(Math.random() * 2); //0 or 1
    switch(difficulty) {
        case EASY:
            // create problem
            base = baseSelector();
            for(i=0; i<termNum; i++){
                degree = (Math.floor(Math.random() * 51))*(-1)**(Math.floor(Math.random() * 2)); // (+,-)[0,50]
                degreeSum += degree;
                problemBody += concat(base,i,degree); 
            }
            if(isDivided) {
                let buttom = '';
                termNum = Math.floor(Math.random() * 4) + 2; //random 1-5
                let degreeSum2 = 0;
                for(i=0; i<termNum; i++){
                    degree = (Math.floor(Math.random() * 51))*(-1)**(Math.floor(Math.random() * 2)); // (+,-)[0,50]
                    degreeSum2 += degree;
                    buttom += concat(base,i,degree); 
                }
                problemBody = `(${problemBody})/(${buttom})`;
                degreeSum -= degreeSum2;
            }

            // create answer
            if(base<0) {
                answerBody = `(${base})^[${degreeSum}]`;
            }else {
                answerBody = `${base}^[${degreeSum}]`;
            }

            //create hint
            hintBody = 'a^m*a^n = a^(m+n)|สมบัติการคูณของเลขยกกำลัง';
            if(isDivided) hintBody += '\n(a^m)/(a^n) = a^(m-n)|สมบัติการหารของเลขยกกำลัง'

            //save to database
            const problem = new Problem({body: problemBody, 
                                        subtopicName: subtopicName,
                                        difficulty: difficulty});
            const newProblem = await problem.save();
            const problemId = newProblem._id;
            const answer = new Answer({problemId:problemId, body:answerBody});
            const newAnswer = await answer.save();
            const hint = new Hint({problemId:problemId, body: hintBody});
            const newHint = await hint.save();
            return {newProblem, newAnswer, newHint};
        case MEDIUM:
            console.log('hello jaaa');
            // opt1=> 49*7^[2],  opt2 => (1/2)^2*(0.5)^[3]
            termNum = Math.floor(Math.random() * 4) + 3; //random 2-6
            let opt = Math.floor(Math.random() * 2) + 1; //1,2
            switch(opt) {
                case 1: //49*7^[2]
                    base = (Math.floor(Math.random() * 24) + 2)*(-1)**(Math.floor(Math.random() * 2)); //random (+-)[2,25]
                    let rand = Array.from({length: termNum}, () => Math.floor(Math.random() *2));
                    let sum = rand.reduce((a, b) => a + b, 0);
                    console.log(rand);
                    if(sum==0){
                        rand.push(1);
                        termNum+=1;
                    } else if(sum==termNum){
                        rand.push(0);
                        termNum+=1;
                    }
                    console.log(rand);
                    console.log(sum);
                    for(i=0; i<termNum; i++){
                        // let rand = Math.floor(Math.random() * 2);
                        if(rand[i]) {
                            degree = (Math.floor(Math.random() * 4)) + 2; //random [2,5]
                        }
                        else {
                            degree = (Math.floor(Math.random() * 51))*(-1)**(Math.floor(Math.random() * 2)); // (+,-)[0,50]
                        }
                        degreeSum += degree;
                        if(rand[i]){
                            problemBody += concat(base**degree,i,1)
                        }
                        else problemBody += concat(base,i,degree); 
                    }
                    // create answer
                    if(base<0) {
                        answerBody = `(${base})^[${degreeSum}]`;
                    }else {
                        answerBody = `${base}^[${degreeSum}]`;
                    }
                    console.log(problemBody);
                    console.log(answerBody);
                    break;

                case 2: //(1/2)^2*(0.5)^[3]
                    let bList = [2,4,5,10,20,25,50,100]
                    let b = bList[Math.floor(Math.random() * bList.length)];
                    let a = (Math.floor(Math.random() * (b-1)) + 1)*(-1)**(Math.floor(Math.random() * 2)); //random (+-)[1,100]
                    let fraction = `(${a}/${b})`;
                    let decimal = a/b;
                    for(i=0; i<termNum; i++){
                        let rand = Math.floor(Math.random() * 2);
                        base = rand? fraction: decimal;
                        degree = (Math.floor(Math.random() * 51))*(-1)**(Math.floor(Math.random() * 2)); // (+,-)[0,50]
                        degreeSum += degree;
                        problemBody += concat(base,i,degree); 
                    }
                    // create answer
                    if(base<0) {
                        answerBody = `(${base})^[${degreeSum}]`;
                    }else {
                        answerBody = `${base}^[${degreeSum}]`;
                    }
                    console.log(problemBody);
                    console.log(answerBody);
                    break;
            }
            // fraction= a/b
            // let bList = [2,4,5,10,20,25,50,100]
            // let b = bList[Math.floor(Math.random() * bList.length)];
            // let a = (Math.floor(Math.random() * (b-1)) + 1)*(-1)**(Math.floor(Math.random() * 2)); //random (+-)[1,100]
            // let fraction = `(${a}/${b})`;
            // let decimal = a/b;
            // // console.log(fraction);
            // // console.log(decimal)
            // problemBody = '';
            // base = (Math.floor(Math.random() * 24) + 2)*(-1)**(Math.floor(Math.random() * 2)); //random (+-)[2,25]
            // for(i=0; i<termNum; i++){
            //     let rand = Math.floor(Math.random() * 2);
            //     if(opt==2){
            //         base = rand? fraction: decimal;
            //     }
            //     if(rand & opt==1) {
            //         degree = (Math.floor(Math.random() * 4)) + 1; //random [1,5]
            //     }
            //     else {
            //         degree = (Math.floor(Math.random() * 51))*(-1)**(Math.floor(Math.random() * 2)); // (+,-)[0,50]
            //     }
            //     degreeSum += degree;
            //     if(rand & opt==1){
            //         problemBody += concat(base**degree,i,1)
            //     }
            //     else problemBody += concat(base,i,degree); 
            // }
            // // create answer
            // if(base<0) {
            //     answerBody = `(${base})^[${degreeSum}]`;
            // }else {
            //     answerBody = `${base}^[${degreeSum}]`;
            // }
            // console.log(answerBody)
            // console.log(problemBody);
            return 'genarateTestSubtopic MEDIUM';
        case HARD: 
            return 'genarateTestSubtopic HARD';
        default:
            return 'genarateTestSubtopic default';
    }
}

const genarateSubtopic3 = async (subtopicName, difficulty) => {
    switch(difficulty) {
        case EASY:
            return 'Not Implement'
        case MEDIUM:
            return 'Not Implement'
        case HARD:
            return 'Not Implement'
    }
}

module.exports = {mathGenerate}