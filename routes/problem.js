const express = require("express");

const problemController = require("../controllers/problem");
const { checkAnswer } = require("../controllers/answer");

const { authJwt, adminOnly } = require('../middlewares');

const router = express.Router();

router.get("/", [authJwt], problemController.getAllProblems)
router.post("/add-problem", [authJwt, adminOnly], problemController.addProblem)
router.post("/generate-problem", [authJwt, adminOnly], problemController.generateProblem)
router.post("/add-problem-answer-hint", [authJwt, adminOnly], problemController.addProblemAnswerHint)
router.post("/get-problem-for-user", [authJwt], problemController.getProblemForUser)
router.post("/get-and-check-answer", [authJwt], checkAnswer,problemController.checkAnswerAndUpdateDifficulty);
router.get("/get-problem-answer-hint/", [authJwt], problemController.getProblemAnswerHint)
module.exports = router;
