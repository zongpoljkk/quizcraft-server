const Problem = require('../models/Problem');

exports.getAllProblems = (req, res, next) => {
  // res.send('Not Implement: list problem');
  Problem.find().exec((err, problems) => {
    if(err) res.send(err);
    else if (!problems) res.send(400);
    else res.send(problems);
    next();
  });
}

// For testing
exports.addProblem = (req, res, next) => {
  // res.send('Not Implement: addProblem');
  const problem = new Problem(req.body);
  problem.save((err, newProblem) => {
    if(err) res.send(err);
    else if (!newProblem) res.send(400);
    else res.send(newProblem);
    next();
  })
}