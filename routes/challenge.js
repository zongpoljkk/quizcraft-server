const express = require("express");

const challengeController = require("../controllers/challenge");

const { authJwt, adminOnly } = require("../middlewares");

const router = express.Router();

router.get('/get-all-my-challenges/', [authJwt], challengeController.getAllMyChallenges);
router.get('/get-final-challenge-result/', [authJwt], challengeController.getFinalChallengeResult);
router.post('/random-challenge', [authJwt], challengeController.randomChallenge);
router.post('/specific-challenge', [authJwt], challengeController.specificChallenge);
router.get('/challenge-info/', [authJwt], challengeController.getChallengeInfo);
router.put('/read-challenge', [authJwt], challengeController.readChallenge);
router.delete('/delete-challenge', [authJwt], challengeController.deleteChallenge);

module.exports = router;