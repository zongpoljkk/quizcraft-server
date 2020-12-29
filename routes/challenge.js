const express = require('express');

const challengeController = require('../controllers/challenge');

const { authJwt, adminOnly } = require('../middlewares');

const router = express.Router();

router.post('/random-challenge', [authJwt], challengeController.randomChallenge);
router.get('/get-all-my-challenges/', [authJwt], challengeController.getAllMyChallenges);
router.post('/specific-challenge', [authJwt], challengeController.specificChallenge);

module.exports = router;
