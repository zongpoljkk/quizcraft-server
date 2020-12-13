const User = require("../models/User");

exports.getLeaderBoard = async (req, res, next) => {
  const userId = req.query.userId;
  console.log(userId);
  User.findById(userId)
    .select("_id school class")
    .exec((err, user) => {
      if (err) {
        console.log(`errrrror`);
        res.status(500).send({ error: err });
      } else if (!user) {
        res.status(400).send("The user with the given userId was not found");
        return;
      }
      console.log(user);
      const classroom = user.class;
      const school = user.school;
      // * Same School * //
      User.find({ school: school })
        .select("_id username level")
        .exec((err, users) => {
          if (err) {
            res.status(500).send({ error: err });
          } else if (!user) {
            res.status(400).send("The school name was not found");
            return;
          }

          let copyUsers = users.slice(0);
          const sortedUsers = copyUsers.sort((a, b) => {
            return b.level - a.level;
          });
          console.log(sortedUsers);

          res.send(sortedUsers);
        });

      // res.send(user);
      // next();
    });
};
