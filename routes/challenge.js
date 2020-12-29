const express = require('express');

const challengeController = require('../controllers/challenge');

const { authJwt, adminOnly } = require('../middlewares');

const router = express.Router();

router.post('/random-challenge', [authJwt], challengeController.randomChallenge);
router.put('/read-challenge', [authJwt], challengeController.readChallenge);

module.exports = router;
