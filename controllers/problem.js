const Problem = require('../models/Problem');
const Subtopic = require('../models/Subtopic');
const { mathGenerate } = require('./mathProblemGenerator');

exports.getAllProblems = (req, res, next) => {
    Problem.find().exec((err, problems) => {
        if(err) res.send(err);
        else if (!problems) res.send(400);
        else res.send(problems);
        next();
    });
}

// For testing
exports.addProblem = (req, res, next) => {
    const problem = new Problem(req.body);
    problem.save((err, newProblem) => {
        if(err) res.send(err);
        else if (!newProblem) res.send(400);
        else res.send(newProblem);
        next();
    })
}

exports.getProblems = (req, res, next) => {
    const subtopicName = req.body.subtopicName;
    const difficulty = req.body.difficulty;
    Problem.aggregate([
        { $lookup: {
                from: 'subtopics',
                localField: 'subtopicName',
                foreignField: 'subtopicName',
                as: 'subtopic'
            }
        }, 
        { $match: {
            difficulty: difficulty,
            subtopicName: subtopicName 
            } 
        }
    ]).exec((err, problem) => {
        if(err) return res.status(400).json({ success: false, error: err })
        else if (!problem) return res.status(404);
        else return res.status(200).json({ success: true, data: problem })
        next();
    });
}

// for testing
exports.generateProblem = async (req, res, next) => {
    const {newProblem, newAnswer, newHint} = await mathGenerate(req.body);
    res.send({problem:newProblem, answer:newAnswer, hint:newHint});
}

exports.getProblemForUser = async (req, res, next) => {
    const subtopicName = req.body.subtopicName;
    const difficulty = req.body.difficulty;
    const userId = req.body.userId;
    res.send('TODO');
}