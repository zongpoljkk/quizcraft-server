const express = require("express");

const groupController = require("../controllers/group");

const { authJwt, adminOnly } = require("../middlewares");

const router = express.Router();

router.post("/create-group", [authJwt], groupController.createGroup);
router.delete("/delete-group", [authJwt], groupController.deleteGroup);
router.put("/leave-group", [authJwt], groupController.leaveGroup);

module.exports = router;