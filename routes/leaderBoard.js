const express = require("express");

const userController = require("../controllers/user");

const router = express.Router();

// /leader-board/get-leader-board => GET
router.get("/get-leader-board", userController.getLeaderBoard);

module.exports = router;
