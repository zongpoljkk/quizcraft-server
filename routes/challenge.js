const express = require("express");

const challengeController = require("../controllers/challenge");

const { authJwt, adminOnly } = require("../middlewares");

const router = express.Router();

router.get(
  "/get-problems",
  [authJwt],
  challengeController.getProblemByChallengeId
);
router.post(
  "/random-challenge",
  [authJwt],
  challengeController.randomChallenge
);
router.post(
  "/specific-challenge",
  [authJwt],
  challengeController.specificChallenge
);
router.put("/read-challenge", [authJwt], challengeController.readChallenge);

module.exports = router;
