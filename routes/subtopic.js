const express = require('express');

const subtopicController = require('../controllers/subtopic');

const router = express.Router();

router.get('/', subtopicController.getAllSubtopics)
router.post('/add-subtopic', subtopicController.addSubtopic)

module.exports = router;
