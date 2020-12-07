const express = require('express');

const subtopicController = require('../controllers/subtopic');

const router = express.Router();

router.get('/', subtopicController.getAllSubtopics)
router.get('/get-all-subjects', subtopicController.getAllSubjects)
router.get('/get-topics/', subtopicController.getTopicBySubjectName)
router.get('/get-subtopics/', subtopicController.getSubtopicByTopicName)
router.post('/add-subtopic', subtopicController.addSubtopic)

module.exports = router;
