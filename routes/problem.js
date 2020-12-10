const express = require("express");

const problemController = require("../controllers/problem");
const { getAnswer } = require("../controllers/answer");

const router = express.Router();

router.get("/", problemController.getAllProblems);
router.post("/add-problem", problemController.addProblem);
router.post("/get-problems", problemController.getProblems);
router.post("/generate-problem", problemController.generateProblem);
router.post("/add-problem-answer-hint", problemController.addProblemAnswerHint);
router.post("/get-problem-for-user", problemController.getProblemForUser);
router.put(
  "/put-difficulty-index",
  getAnswer,
  problemController.putDifficultyIndex
);

module.exports = router;
