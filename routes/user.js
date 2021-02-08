const express = require("express");

const multer = require("multer");
const crypto = require("crypto");

const GridFsStorage = require("multer-gridfs-storage");

const keys = require("../config/keys");
const userController = require("../controllers/user");

const { authJwt, adminOnly } = require("../middlewares");

const router = express.Router();

const storage = new GridFsStorage({
  url: keys.mongoURI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = file.originalname;
        const fileInfo = {
          filename: filename,
          bucketName: "uploads",
        };
        resolve(fileInfo);
      });
    });
  },
});

const upload = multer({ storage });

router.get("/", [authJwt], userController.getAllUsers);
router.get("/get-user/", userController.getProfileByUID);
router.get("/get-amount-of-items", [authJwt], userController.getAmountOfItems);
router.put("/edit-username", [authJwt], userController.editUsername);
router.post("/add-user", [authJwt, adminOnly], userController.addUser);
router.put("/used-item", [authJwt], userController.usedItem);
router.put("/buy-item", [authJwt], userController.buyItem);
router.put(
  "/change-profile-picture",
  upload.single("image"),
  [authJwt],
  userController.changeProfilePicture
);

module.exports = router;
