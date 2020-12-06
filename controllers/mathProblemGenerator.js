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
            a =  randInt(2,10,true)//random (+-)[2,10]
            break;
        case 2: //float
            a = (((Math.random() * 9) + 1.01).toFixed(2))*(-1)**(Math.floor(Math.random() * 2)); //random (+-)[1.01,10.00)
            break;
        case 3: //fraction
            b = randInt(1,10,true)//random (+-)[1,10]
            c = randInt(2,10,false)//random [2,10]
            c = (c==b)? c+1 : c;
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

const randInt = (start,end,haveNegative) => {
    if(haveNegative){
        return (Math.floor(Math.random() * (end-start+1)) + start)*(-1)**(Math.floor(Math.random() * 2)); 
    }else {
        return Math.floor(Math.random() * (end-start+1)) + start; 
    }
}

const diverse = (termNum) => {
    let randList = Array.from({length: termNum}, () => Math.floor(Math.random() *2));
    let sum = randList.reduce((a, b) => a + b, 0);
    if(sum==0){
        randList.push(1);
        termNum+=1;
    } else if(sum==termNum){
        randList.push(0);
        termNum+=1;
    }
    return [{randList, termNum}];
}

const plusDegreeString = (degreeList) => {
    let out;
    if(degreeList.length==1){
        out = `[${degreeList[0]}]`
    }else {
        out = degreeList[0]<0? `(${degreeList[0]})` : `${degreeList[0]}`; 
        out += degreeList.slice(1,degreeList.length).reduce((prev,cur) => cur<0? prev+`+(${cur})` : prev+`+${cur}`, '');
        out = `[(${out})]`;
    }
    return out;
}

const minusDegreeString = (degreeList) => {
    let out = degreeList[0]<0? `(${degreeList[0]})` : `${degreeList[0]}`; 
    out += degreeList.slice(1,degreeList.length).reduce((prev,cur) => cur<0? prev+`-(${cur})` : prev+`-${cur}`, '');
    out = `[(${out})]`;
    return out;
}

const genarateSubtopic2 = async (subtopicName, difficulty) => {
    var termNum = randInt(2,5,false); //random 2-5
    var problemBody = '';
    var answerBody;
    var hintBody;
    var solution, solutionButtom;
    var base, degree, randList, baseList, degreeList;
    var baseList2, degreeList2
    var degreeSum = 0;
    var isDivided = randInt(0,1,false); //0 or 1
    var buttom = '';
    var degreeSum2 = 0;
    let problem, newProblem, problemId, answer, newAnswer, hint, newHint;
    switch(difficulty) {
        case EASY:
            // create problem
            base = baseSelector();
            solution = base<0? `(${base})^`: `${base}^`;
            degreeList = []
            for(i=0; i<termNum; i++){
                degree =  randInt(0,50,true); // (+,-)[0,50]
                degreeList.push(degree);
                degreeSum += degree;
                problemBody += concat(base,i,degree);
            }
            solution += plusDegreeString(degreeList);
            if(isDivided) {
                termNum = randInt(1,5,false) //random 1-5
                solutionButtom = base<0? `(${base})^`: `${base}^`;;
                degreeList2 = [];
                for(i=0; i<termNum; i++){
                    degree = randInt(0,50,true); // (+,-)[0,50]
                    degreeList2.push(degree);
                    degreeSum2 += degree;
                    buttom += concat(base,i,degree); 
                }
                solutionButtom+=plusDegreeString(degreeList2);
                problemBody = `(${problemBody})/(${buttom})`;
                solution = `(${solution})/(${solutionButtom})`
                solution += base<0? `\n((${base})^[${degreeSum}])/((${base})^[${degreeSum2}])` : `\n(${base}^[${degreeSum}])/(${base}^[${degreeSum2}])`;
                solution += base<0? `\n(${base})^${minusDegreeString([degreeSum,degreeSum2])}` : `\n${base}^${minusDegreeString([degreeSum,degreeSum2])}`;
                degreeSum -= degreeSum2;
            }

            // create answer
            answerBody = base<0? `(${base})^[${degreeSum}]`: `${base}^[${degreeSum}]`;
            solution += `\n${answerBody}`;

            //create hint
            hintBody = `a^m*a^n = a^(m+n)|สมบัติการคูณของเลขยกกำลัง`;
            if(isDivided) hintBody += `\n(a^m)/(a^n) = a^(m-n)|สมบัติการหารของเลขยกกำลัง`;

            //save to database
            problem = new Problem({body: problemBody, 
                                        subtopicName: subtopicName,
                                        difficulty: difficulty});
            newProblem = await problem.save();
            problemId = newProblem._id;
            answer = new Answer({problemId:problemId, body:answerBody, solution:solution});
            newAnswer = await answer.save();
            hint = new Hint({problemId:problemId, body: hintBody});
            newHint = await hint.save();
            return {newProblem, newAnswer, newHint};

        case MEDIUM:
            // opt1=> 49*7^[2],  opt2 => (1/2)^2*(0.5)^[3],  opt3 => (-3)^2*(3)^2
            termNum = randInt(3,6,false); //random 3-6
            let opt = randInt(1,3,false); //1,2,3
            console.log(opt);
            switch(opt) {
                case 1: //49*7^[2]
                    base = randInt(2,25,true); //random (+-)[2,25]
                    [{randList, termNum}] = diverse(termNum);
                    degreeList = [];
                    solution = '';
                    for(i=0; i<termNum; i++){
                        if(randList[i]) {
                            degree = randInt(2,5,false); //random [2,5]
                        }
                        else {
                            degree = randInt(0,50,true); // (+,-)[0,50]
                        }
                        degreeList.push(degree);
                        degreeSum += degree;
                        if(randList[i]){
                            problemBody += concat(base**degree,i,1);
                        }
                        else problemBody += concat(base,i,degree); 
                        
                        solution += concat(base,i,degree);
                    }

                    if(isDivided) {
                        termNum = randInt(1,5,false); //random 1-5
                        [{randList, termNum}] = diverse(termNum);
                        solutionButtom = '';
                        degreeList2 = [];
                        for(i=0; i<termNum; i++){
                            if(randList[i]) {
                                degree = randInt(2,5,false); //random [2,5]
                            }
                            else {
                                degree = randInt(0,50,true); // (+,-)[0,50]
                            }
                            degreeList2.push(degree);
                            degreeSum2 += degree;
                            if(randList[i]){
                                buttom += concat(base**degree,i,1)
                            }
                            else buttom += concat(base,i,degree); 

                            solutionButtom += concat(base,i,degree);
                        }
                        solution = `(${solution})/(${solutionButtom})`
                        problemBody = `(${problemBody})/(${buttom})`;
                        solution += base<0? `\n((${base})^${plusDegreeString(degreeList)})/((${base})^${plusDegreeString(degreeList2)})` 
                                            : `\n(${base}^${plusDegreeString(degreeList)})/(${base}^${plusDegreeString(degreeList2)})`;
                        solution += base<0? `\n((${base})^${plusDegreeString([degreeSum])})/((${base})^${plusDegreeString([degreeSum2])})`
                                            : `\n(${base}^${plusDegreeString([degreeSum])})/(${base}^${plusDegreeString([degreeSum2])})`;
                        solution += base<0? `\n(${base})^${minusDegreeString([degreeSum,degreeSum2])}` : `\n${base}^${minusDegreeString([degreeSum,degreeSum2])}`;
                        degreeSum -= degreeSum2;
                    }else {
                        solution += base<0? `\n(${base})^${plusDegreeString(degreeList)}` : `\n${base}^${plusDegreeString(degreeList)}`;
                    }

                    // create answer
                    answerBody = base<0? `(${base})^[${degreeSum}]`: `${base}^[${degreeSum}]`;
                    solution += `\n${answerBody}`;
                    console.log(solution);

                    //create hint
                    hintBody = `ลองเปลี่ยนเลขธรรมดาให้เป็นเลขยกกำลังที่ฐานเท่ากับเลขยกกำลังตัวอื่นดูสิ\na^m*a^n = a^(m+n)|สมบัติการคูณของเลขยกกำลัง`;
                    if(isDivided) hintBody += `\n(a^m)/(a^n) = a^(m-n)|สมบัติการหารของเลขยกกำลัง`;
                    break;

                case 2: //(1/2)^2*(0.5)^[3]
                    let bList = [2,4,5,10,20,25,50,100]
                    let b = bList[Math.floor(Math.random() * bList.length)];
                    let a = randInt(1,100,true); //random (+-)[1,100]
                    let fraction = `(${a}/${b})`;
                    let decimal = a/b;
                    
                    [{randList, termNum}] = diverse(termNum);
                    
                    for(i=0; i<termNum; i++){
                        base = randList[i]? fraction: decimal;
                        degree = randInt(0,50,true); // (+,-)[0,50]
                        degreeSum += degree;
                        problemBody += concat(base,i,degree); 
                    }

                    if(isDivided) {
                        termNum = randInt(1,5,false); //random 1-5
                        [{randList, termNum}] = diverse(termNum);
                        for(i=0; i<termNum; i++){
                            base = randList[i]? fraction: decimal;
                            degree = randInt(0,50,true); // (+,-)[0,50]
                            degreeSum2 += degree;
                            buttom += concat(base,i,degree); 
                        }
                        problemBody = `(${problemBody})/(${buttom})`;
                        degreeSum -= degreeSum2;
                    }

                    // create answer
                    answerBody = base<0? `(${base})^[${degreeSum}]`: `${base}^[${degreeSum}]`;

                    //create hint
                    hintBody = `ถ้าสังเกตดี ๆ เศษส่วนกับทศนิยมเท่ากันนะ\na^m*a^n = a^(m+n)|สมบัติการคูณของเลขยกกำลัง`;
                    if(isDivided) hintBody += `\n(a^m)/(a^n) = a^(m-n)|สมบัติการหารของเลขยกกำลัง`;
                    break;
                
                case 3: // (-3)^2*(3)^2
                    let base1 = randInt(2,25,false); //random [2,25]
                    let base2 = (-1)*base1; //(-base1)
                    let isLessThanZero = 0;
                 
                    [{randList, termNum}] = diverse(termNum);
                  
                    for(i=0; i<termNum; i++){
                        base = randList[i]? base1: base2;
                        degree = randInt(0,50,true); // (+,-)[0,50]
                        if(base<0 & degree%2!=0) { //พจน์นี้ติดลบ
                            isLessThanZero = isLessThanZero? 0:1;
                        }
                        degreeSum += degree;
                        problemBody += concat(base,i,degree); 
                    }

                    if(isDivided) {
                        termNum = randInt(1,5,false); //random 1-5
                        [{randList, termNum}] = diverse(termNum);
                        for(i=0; i<termNum; i++){
                            base = randList[i]? base1: base2;
                            degree = randInt(0,50,true); // (+,-)[0,50]
                            if(base<0 & degree%2!=0) { //พจน์นี้ติดลบ
                                isLessThanZero = isLessThanZero? 0:1;
                            }
                            degreeSum2 += degree;
                            buttom += concat(base,i,degree); 
                        }
                        problemBody = `(${problemBody})/(${buttom})`;
                        degreeSum -= degreeSum2;
                    }

                    // create answer
                    answerBody = isLessThanZero? `-${base1}^[${degreeSum}]`: `${base1}^[${degreeSum}]`;

                    //create hint
                    hintBody = `ถ้าเลขติดลบยกกำลังด้วยเลขคู่จะกลายเป็นค่าบวกนะ เช่น (-3)^[2] = 9 = 3^[2]\nแต่ถ้าเลขติดลบยกกำลังด้วยเลขคี่จะกลายเป็นค่าลบนะ เช่น (-3)^[3] = -27 = -(3^[3])\na^m*a^n = a^(m+n)|สมบัติการคูณของเลขยกกำลัง`;
                    if(isDivided) hintBody += `\n(a^m)/(a^n) = a^(m-n)|สมบัติการหารของเลขยกกำลัง`;
                    break;
            }
            //save to database
            problem = new Problem({body: problemBody, 
                                        subtopicName: subtopicName,
                                        difficulty: difficulty});
            newProblem = await problem.save();
            problemId = newProblem._id;
            answer = new Answer({problemId:problemId, body:answerBody});
            newAnswer = await answer.save();
            hint = new Hint({problemId:problemId, body: hintBody});
            newHint = await hint.save();
            return {newProblem, newAnswer, newHint};
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