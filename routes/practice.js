const express = require("express");

const answerController = require("../controllers/answer");

const router = express.Router();

// /practice/get-answer => POST
router.post("/get-answer", answerController.checkAnswer);

module.exports = router;
