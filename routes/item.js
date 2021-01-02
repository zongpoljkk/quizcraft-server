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
          bucketName: "uploads",
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
    { name: "lottie", maxCount: 1 }
  ]),
  itemController.addFile
  );
router.get("/", itemController.getAllItems);
router.post("/add-item", itemController.addItem);

module.exports = router;
