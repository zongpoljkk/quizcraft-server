const express = require('express');

const subtopicController = require('../controllers/subtopic');

const { authJwt, adminOnly } = require('../middlewares');

const router = express.Router();

router.get('/', [authJwt], subtopicController.getAllSubtopics)
router.get('/get-all-subjects', [authJwt], subtopicController.getAllSubjects)
router.get('/get-topics/', [authJwt], subtopicController.getTopicBySubjectName)
router.get('/get-subtopics/', [authJwt], subtopicController.getSubtopicByTopicName)
router.post('/add-subtopic', [authJwt, adminOnly], subtopicController.addSubtopic)
router.put('/update-available-difficulty', [authJwt, adminOnly], subtopicController.updateAvailableDifficulty)
router.get('/get-available-difficulty/', [authJwt], subtopicController.getAvailableDifficultyBySubtopicName)

module.exports = router;
