const express = require('express');

const multer = require("multer");
const crypto = require("crypto");

const GridFsStorage = require("multer-gridfs-storage");

const keys = require("../config/keys");

const subtopicController = require('../controllers/subtopic');

const { authJwt, adminOnly } = require('../middlewares');

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

router.get('/', [authJwt], subtopicController.getAllSubtopics)
router.get('/get-all-subjects', [authJwt], subtopicController.getAllSubjects)
router.get('/get-topics/', [authJwt], subtopicController.getTopicBySubjectName)
router.get('/get-subtopics/', [authJwt], subtopicController.getSubtopicByTopicName)
router.get('/get-available-difficulty/', [authJwt], subtopicController.getAvailableDifficultyBySubtopicName)
router.post('/add-subtopic', [authJwt, adminOnly], subtopicController.addSubtopic)
router.put('/update-available-difficulty', [authJwt, adminOnly], subtopicController.updateAvailableDifficulty)
router.put(
  "/add-file",
  upload.fields([
    { name: "subjectImage", maxCount: 1 },
    { name: "topicImage", maxCount: 1 },
  ]),
  [authJwt, adminOnly], 
  subtopicController.addFile
);

module.exports = router;
