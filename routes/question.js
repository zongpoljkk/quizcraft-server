const express = require('express');

const questionController = require('../controllers/question');

const router = express.Router();

router.get('/', questionController.getAllQuestions)

module.exports = router;
