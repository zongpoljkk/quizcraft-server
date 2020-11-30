const express = require("express");

const answerController = require("../controllers/answer");

const router = express.Router();

// /practice/get-answer => GET
router.get("/get-answer", answerController.getAnswer);

module.exports = router;
