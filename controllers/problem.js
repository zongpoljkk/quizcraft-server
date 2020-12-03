const Problem = require('../models/Problem');
const Subtopic = require('../models/Subtopic');
const { generate } = require('./problemGenerater');

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

exports.getProblem = (req, res, next) => {
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
        if(err) res.send(err);
        else if (!problem) res.send(400);
        else res.send(problem);
        next();
    });
}

// for testing
exports.generateProblem = async (req, res, next) => {
    const {newProblem, newAnswer, newHint} = await generate(req.body);
    res.send({problem:newProblem, answer:newAnswer, hint:newHint});
}