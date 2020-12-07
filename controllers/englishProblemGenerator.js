const Problem = require('../models/Problem');
const Answer = require('../models/Answer');
const Hint = require('../models/Hint');
const EASY = 'EASY';
const MEDIUM = 'MEDIUM';
const HARD = 'HARD';
const alphabet = "abcdefghijklmnopqrstuvwxyz"

const englishGenerate = ({subtopicName, difficulty}) => {
    switch(subtopicName) {
        case 'แกรมมาร์':
            return genarateSubtopic1(subtopicName, difficulty);
        default:
            return 'Hello';
    }
}

const genarateSubtopic1 = (subtopicName, difficulty) =>{
    
}