const express = require("express");
const multer = require("multer");
const crypto = require("crypto");

const GridFsStorage = require("multer-gridfs-storage");

const keys = require("../config/keys");

const achievementController = require("../controllers/achievement");

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
          bucketName: "media",
        };
        resolve(fileInfo);
      });
    });
  },
});

const upload = multer({ storage });

router.get("/", achievementController.getAllAchievements);
router.get("/my-acheivements", [authJwt], achievementController.getMyAchievements);
router.post("/add-achievement", [authJwt], achievementController.addAchievement);
router.put(
  "/add-file",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "lottie", maxCount: 1 },
  ]),
  achievementController.addFile
);

module.exports = router;
