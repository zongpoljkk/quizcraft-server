const express = require('express');

const subtopicController = require('../controllers/subtopic');

const router = express.Router();

router.get('/', subtopicController.getAllSubtopics)
router.post('/add-subtopic', subtopicController.addSubtopic)
router.get('/get-subtopic/', subtopicController.getSubtopicByTopic)
router.get('/get-all-subjects', subtopicController.getAllSubjects)
router.get('/get-topic/', subtopicController.getTopicBySubject)

module.exports = router;
