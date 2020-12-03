const Problem = require('../models/Problem');
const Answer = require('../models/Answer');
const Hint = require('../models/Hint');
const EASY = 'EASY';
const MEDIUM = 'MEDIUM';
const HARD = 'HARD';

const generate = ({subtopicName, difficulty}) => {
    switch(subtopicName) {
        case 'test':
            return genarateTestSubtopic(subtopicName, difficulty);
        default:
            return 'Hello';
    }
}

const genarateTestSubtopic = async (subtopicName, difficulty) => {
    switch(difficulty) {
        case EASY:
            // template <a^m*a^n = a^(m+n)>
            const termNum = Math.floor(Math.random() * 5) + 1; //random 1-5
            const a = Math.floor(Math.random() * 10) + 1; //random 1-10
            // var degreeList = [];
            var degreeSum = 0;
            var problemBody = '';
            for(i=0; i<termNum; i++){
                let temp = Math.floor(Math.random() * 100) + 1;
                degreeSum += temp;
                // degreeList.push(temp);
                if(i==0){
                    problemBody+= `${a}^[${temp}]`;
                }else {
                    problemBody+=`*${a}^[${temp}]`;
                }   
            }
            const answerBody = `${a}^${degreeSum}`;
            const problem = new Problem({body: problemBody, 
                                        subtopicName: subtopicName,
                                        difficulty: difficulty});
            const newProblem = await problem.save();
            const problemId = newProblem._id;
            console.log(problemId)
            const answer = new Answer({problemId:problemId, body:answerBody});
            const newAnswer = await answer.save();
            const hint = new Hint({problemId:problemId, body: 'a^m*a^n = a^(m+n)|สมบัติการคูณของเลขยกกำลัง'});
            const newHint = await hint.save();
            return {newProblem, newAnswer, newHint};
        case MEDIUM:
            return 'genarateTestSubtopic MEDIUM';
        case HARD: 
            return 'genarateTestSubtopic HARD';
        default:
            return 'genarateTestSubtopic default';
    }
}

module.exports = {generate}