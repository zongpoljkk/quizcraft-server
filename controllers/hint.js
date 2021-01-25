const Hint = require('../models/Hint');

exports.getHintByProblemId = (req, res, next) => {
  Hint.findOne({ problemId: req.query.problemId }, (err, hint) => {
    if(err) {
      return res.status(500).json({ success: false, error: err })
    }
    else if (!hint) {
      return res
        .status(400)
        .json({ success: false, error: `Hint not found` })
    }
    else return res.status(200).json({ success: true, data: hint })
    next();
  });
}