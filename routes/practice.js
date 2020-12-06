const express = require("express");

const answerController = require("../controllers/answer");

const router = express.Router();

// /practice/get-answer => GET
router.get("/get-answer/:problemId", answerController.getAnswer);

// /practice/post-answer => POST
router.post("/post-answer", answerController.postAnswer);

module.exports = router;
