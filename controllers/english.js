const English = require("../models/English");
const {generateAdverbsOfManner} = require("./englishProblem/adverbsOfManner")

exports.addEnglishData = (req, res) => {
  const english = new English(req.body);
  english.save((err, newEnglish) => {
    if (err) res.send(err);
    else if (!newEnglish) res.send(400);
    else res.send(newEnglish);
  })
}

//test
exports.test = (req, res)=>{
  generateAdverbsOfManner('test','EASY')
  return res.send("Hey")
}
