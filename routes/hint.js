const express = require('express');

const hintController = require('../controllers/hint');

const { authJwt, adminOnly } = require('../middlewares');

const router = express.Router();

router.get('/', [authJwt], hintController.getAllHints)
router.get('/get-hint/', [authJwt], hintController.getHintByProblemId)

module.exports = router;

