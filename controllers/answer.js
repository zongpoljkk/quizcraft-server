const Answer = require('../models/Answer');

exports.getAnswer = (req, res, next) => {
    const answer = new Answer("Yo");
    answer.save();

    res.json(answer);
}

// exports.postAnswer = (req, res, next) => {

// }