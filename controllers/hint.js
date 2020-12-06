const Hint = require('../models/Hint');

exports.getAllHints = (req, res, next) => {
  Hint.find().exec((err, hints) => {
    if(err) {
      return res.status(400).json({ success: false, error: err })
    }
    if (!hints) {
      return res
        .status(404)
        .json({ success: false, error: `Hint not found` })
    }
    else return res.status(200).json({ success: true, data: hints })
    next();
  });
}

exports.getHintByProblemId = (req, res, next) => {
  Hint.findOne({ problemId: req.query.problemId }, (err, hint) => {
    if(err) {
      return res.status(400).json({ success: false, error: err })
    }
    if (!hint) {
      return res
        .status(404)
        .json({ success: false, error: `Hint not found` })
    }
    else return res.status(200).json({ success: true, data: hint })
    next();
});
}