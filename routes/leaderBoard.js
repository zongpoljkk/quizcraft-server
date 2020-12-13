const express = require("express");

const leaderBoardController = require("../controllers/leaderBoard");

const router = express.Router();

// /leader-board/get-leader-board => GET
router.get("/get-leader-board", leaderBoardController.getLeaderBoard);

module.exports = router;
