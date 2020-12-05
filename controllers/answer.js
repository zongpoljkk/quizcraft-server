const Answer = require("../models/Answer");
const User = require("../models/User");

exports.getAnswer = (req, res, next) => {
  // answer.save();
  console.log("Got in to getAnswer");
  console.log(req.body.problemId);
  const userId = req.body.userId;
  const problemId = req.body.problemId;
  const userAnswer = req.body.userAnswer;
  Answer.findOne({ problemId: problemId }).exec((err, answer) => {
    console.log(answer);
    if (err) {
      console.log(`errrrror`);
      res.send(err);
    } else if (!answer) {
      res.send(400);
      return;
    }
    // console.log(err)
    else {
      console.log("Not Error")
      if (userAnswer === answer.body) {
        console.log("Torb took")
        const user = User.findById(userId)
          .exec()
          .then((user) => {
            user.coin += 10;
            user.save()
          });
        // var prod = ProdProv.findById(this.prodprov)
        //   .exec()
        //   .then((pp) => {
        //     pp.quantitySold += this.quantity;
        //     pp.save();
        //   });
        res.send(true);
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
