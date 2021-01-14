const express = require("express");

const groupController = require("../controllers/group");

const { authJwt, adminOnly } = require("../middlewares");

const router = express.Router();

router.post("/create-group", [authJwt], groupController.createGroup);
router.get("/get-all-group-members/", [authJwt], groupController.getAllGroupMembers);
router.delete("/delete-group", [authJwt], groupController.deleteGroup);
router.put("/leave-group", [authJwt], groupController.leaveGroup);
router.get("/group-scoreboard/", [authJwt], groupController.getGroupScoreboard);

module.exports = router;