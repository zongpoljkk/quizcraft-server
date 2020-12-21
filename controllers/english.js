const English = require("../models/English");
const {generateGrammar} = require("./englishProblem/grammar")

//for mocking data
exports.addEnglishData = (req, res) => {
  const english = new English(req.body);
  english.save((err, newEnglish) => {
    if (err) res.send(err);
    else if (!newEnglish) res.send(400);
    else res.send(newEnglish);
  })
}

//test
exports.test = async (req, res) => {
  const [{ problem, answer, hint }] = await generateGrammar('Grammar','EASY');
  return res.status(200).json({problem,answer,hint});
}
