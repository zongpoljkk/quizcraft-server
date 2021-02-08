const express = require("express");

const multer = require("multer");
const crypto = require("crypto");

const GridFsStorage = require("multer-gridfs-storage");

const keys = require("../config/keys");
const itemController = require("../controllers/item");

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

router.put(
  "/add-file",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "lottie", maxCount: 1 },
  ]),
  [authJwt, adminOnly], 
  itemController.addFile
);
router.get("/", [authJwt], itemController.getAllItems);
router.post("/add-item", [authJwt, adminOnly], itemController.addItem);
router.post("/use-skip-item-for-quiz", [authJwt], itemController.useSkipItemForQuiz);
router.post("/use-refresh-item", [authJwt], itemController.useRefreshItem);
router.post("/use-freeze-item", [authJwt], itemController.useFreezeItem);
router.post("/use-double-item", [authJwt], itemController.useDoubleItem);

module.exports = router;
