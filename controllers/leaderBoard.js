const User = require("../models/User");

exports.getLeaderBoard = async (req, res, next) => {
  const userId = req.query.userId;

  // ? Global ? //
  User.find({})
    .select("_id, username level class")
    .exec((err, users) => {
      if (err) {
        res.status(500).send({ success: false, error: err });
      } else if (!users) {
        res
          .status(400)
          .send({ success: false, error: "Unable to get all users" });
        return;
      }

      let copyUsers = users.slice(0);
      const byAll = copyUsers.sort((a, b) => {
        return b.level - a.level;
      });
      const indexGlobal = byAll.findIndex((user) => {
        return user._id == userId;
      });

      User.findById(userId)
        .select("_id school class")
        .exec((err, user) => {
          if (err) {
            res.status(500).send({ success: false, error: err });
          } else if (!user) {
            res.status(400).send({
              success: false,
              error: "The user with the given userId was not found",
            });
            return;
          }
          const classroom = user.class;
          const school = user.school;

          // * Same School * //
          User.find({ school: school })
            .select("_id username level class")
            .exec((err, users) => {
              if (err) {
                res.status(500).send({ success: false, error: err });
              } else if (!user) {
                res
                  .status(400)
                  .send({
                    success: false,
                    error: "The user with the given school name was not found",
                  });
                return;
              }

              let copyUsers = users.slice(0);
              const bySchool = copyUsers.sort((a, b) => {
                return b.level - a.level;
              });

              const indexSchool = bySchool.findIndex((user) => {
                return user._id == userId;
              });

              const classroomUsers = copyUsers.filter((user) => {
                return user.class === classroom;
              });

              const byClassroom = classroomUsers.sort((a, b) => {
                return b.level - a.level;
              });

              const indexClassroom = byClassroom.findIndex((user) => {
                return user._id == userId;
              });

              res.status(200).send({
                success: true,
                data: {
                  profilePic: user.photo,
                  byAll: byAll,
                  bySchool: bySchool,
                  byClassroom: byClassroom,
                  indexGlobal: indexGlobal + 1,
                  indexSchool: indexSchool + 1,
                  indexClassroom: indexClassroom + 1,
                },
              });
              next();
            });
        });
    });
};
