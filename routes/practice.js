const express = require("express");

const answerController = require("../controllers/answer");

const { authJwt, adminOnly } = require('../middlewares');

const router = express.Router();

// /practice/get-answer => POST
router.post("/check-answer",[authJwt], answerController.checkAnswer);

module.exports = router;
