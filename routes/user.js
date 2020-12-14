const express = require("express");
const multer = require("multer");
const crypto = require("crypto");

const GridFsStorage = require("multer-gridfs-storage");

const keys = require("../config/keys");
const userController = require("../controllers/user");

const router = express.Router();

// const storage = new GridFsStorage({
//   url: keys.mongoURI,
//   file: (req, file) => {
//     return new Promise((resolve, reject) => {
//       crypto.randomBytes(16, (err, buf) => {
//         if (err) {
//           return reject(err);
//         }
//         const filename = file.originalname;
//         const fileInfo = {
//           filename: filename,
//           bucketName: "uploads",
//         };
//         resolve(fileInfo);
//       });
//     });
//   },
// });

// const upload = multer({ storage });



router.get("/", userController.getAllUsers);
router.get("/get-user/", userController.getProfileByUID);
router.put("/edit-username", userController.EditUsername);
router.post("/add-user", userController.addUser);
router.post(
  "/change-profile-picture",
  // upload.single("image"),
  userController.changeProfilePicture
);

module.exports = router;
