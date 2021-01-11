const express = require("express");

const groupController = require("../controllers/group");

const { authJwt, adminOnly } = require("../middlewares");

const router = express.Router();

router.post("/create-group", [authJwt], groupController.createGroup);
router.get("/get-all-group-members/", [authJwt], groupController.getAllGroupMembers);

module.exports = router;