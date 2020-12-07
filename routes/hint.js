const express = require('express');

const hintController = require('../controllers/hint');

const router = express.Router();

router.get('/', hintController.getAllHints)
router.get('/get-hint/', hintController.getHintByProblemId)

module.exports = router;

