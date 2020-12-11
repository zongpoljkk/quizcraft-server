const express = require('express');

const achievementController = require('../controllers/achievement');

const router = express.Router();

router.get('/', achievementController.getAllAchievements)
router.post('/add-achievement', achievementController.addAchievement)

module.exports = router;