const express = require('express');

const problemController = require('../controllers/problem');

const router = express.Router();

router.get('/', problemController.getAllProblems)
router.get('/get-problem-outliers', problemController.getProblemOutliers)
router.post('/add-problem', problemController.addProblem)
router.post('/get-problems', problemController.getProblems)

module.exports = router;
