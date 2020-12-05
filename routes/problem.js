const express = require('express');

const problemController = require('../controllers/problem');

const router = express.Router();

router.get('/', problemController.getAllProblems)
router.post('/add-problem', problemController.addProblem)

module.exports = router;
