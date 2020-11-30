const express = require('express');

const problemController = require('../controllers/problem');

const router = express.Router();

router.get('/', problemController.getAllProblems)
router.post('/addProblem', problemController.addProblem)
router.post('/getProblem', problemController.getProblem)

module.exports = router;
