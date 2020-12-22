const express = require("express");

const leaderBoardController = require("../controllers/leaderBoard");

const { authJwt } = require("../middlewares");

const router = express.Router();

// /leader-board/get-leader-board => GET
router.get(
  "/get-leader-board",
  [authJwt],
  leaderBoardController.getLeaderBoard
);

module.exports = router;
