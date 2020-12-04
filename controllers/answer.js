const Answer = require("../models/Answer");

exports.getAnswer = (req, res, next) => {
    // answer.save();
    console.log(req.body.problem_id)
    const problem_id = req.body.problem_id;
    Answer.findById(problem_id).then((err, answer) => {
      // console.log(err)
      console.log(answer)
    })
    

    res.json(answer);
}

exports.postAnswer = (req, res, next) => {
  console.log("KAOO")
//   console.log(req);
  console.log(req.body)
  console.log(req.body.problem_id)
  console.log(req.body.content)
  const id = req.body.id;
  const content = req.body.content;
  const answer = new Answer({ question_id: id, content: content });
  answer
    .save()
    .then((result) => {
      console.log("save answer");
      res.json(result)
    })
    .catch((err) => {
      console.log(err);
    });
};
