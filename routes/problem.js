const express = require('express');

const problemController = require('../controllers/problem');

const router = express.Router();

router.get('/', problemController.getAllProblems)
router.post('/add-problem', problemController.addProblem)
router.post('/get-problem', problemController.getProblem)
router.post('/generate-problem', problemController.generateProblem)

module.exports = router;
