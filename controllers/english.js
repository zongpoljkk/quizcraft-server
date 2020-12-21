const English = require("../models/English");
const {generateGrammar} = require("./englishProblem/grammar")

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
  generateGrammar('Grammar','EASY')
  return res.send("Hey")
}
