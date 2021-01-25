const English = require("../models/English");
const {generateGrammar} = require("./englishProblem/grammar")

exports.addEnglishData = async (req, res) => {
  const english = new English(req.body);
  english.save((err, newEnglish) => {
    if (err) return res.status(500).json({succes:false, error:err});
    else if (!newEnglish) return res.status(400).json({succes:false, error: "Cannot add data"});
    else return res.status(200).json({succes:true, data:newEnglish});
  })
}

//for test only
exports.test = async (req, res) => {
  const problem = await generateGrammar('Grammar','EASY');
  return res.status(200).json({problem,answer,hint});
}
