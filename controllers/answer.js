const math = require("mathjs");

const Answer = require("../models/Answer");
const User = require("../models/User");

// const validateComputation = (expression1, expression2) => {
//   gen1 = expression1.toString().replace(/[^0-9,+,*]+/g, "");
//   gen2 = expression2.toString().replace(/[^0-9,+,*]+/g, "");
//   if (gen1 === gen2) {
//     return true;
//   } else {
//     return false;
//   }
// };

exports.getAnswer = (req, res, next) => {
  // answer.save();
  console.log(math.evaluate("2^4"))
  console.log("Got in to getAnswer");
  console.log(req.body.problemId);
  console.log("5fcb58f4c53dd068520072a3")
  const userId = req.body.userId;
  const problemId = req.body.problemId;
  const userAnswer = req.body.userAnswer;
  const topic = req.body.topic;
  Answer.findOne({ problemId: problemId }).exec((err, answer) => {
    console.log(answer);
    if (err) {
      console.log(`errrrror`);
      res.send(err);
    } else if (!answer) {
      res.send(400);
      return;
    } else {
      console.log("Not Error");
      // if (topic === "computation") {
      //   if (validateComputation(userAnswer, answer.body)) {
      //   }
      // }
      if (userAnswer === answer.body || (topic === "computation") && (math.evaluate(userAnswer) === math.evaluate(answer.body))) {
        console.log("Torb took");
        const user = User.findById(userId)
          .exec()
          .then((user) => {
            user.coin += 10;
            user.save();
          });

        res.send({correct: true, solution: answer.solution});
      } else {
        res.send(false);
      }
    }

    next();
  });

  // res.json(answer);
};

exports.postAnswer = (req, res, next) => {
  console.log("KAOO");
  //   console.log(req);5fca7457d873ae72d4f59696
  console.log(req.body);
  console.log(req.body.problemId);
  console.log(req.body.body);
  const problemId = req.body.problemId;
  const body = req.body.body;
  const answer = new Answer({ problemId: problemId, body: body });
  answer
    .save()
    .then((result) => {
      console.log("save answer");
      res.json(result);
    })
    .catch((err) => {
      console.log(err);
    });
  next();
};
