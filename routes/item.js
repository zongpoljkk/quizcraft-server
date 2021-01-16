const express = require("express");

const itemController = require("../controllers/item");

const { authJwt, adminOnly } = require('../middlewares');

const router = express.Router();

router.get("/", [authJwt], itemController.getAllItems);
router.post("/add-item", [authJwt, adminOnly], itemController.addItem);
router.post("/use-skip-item-for-challenge", [authJwt], itemController.useSkipItemForChallenge);
router.post("/use-skip-item-for-quiz", [authJwt], itemController.useSkipItemForQuiz);
router.post("/use-refresh-item", [authJwt], itemController.useRefreshItem);

module.exports = router;
