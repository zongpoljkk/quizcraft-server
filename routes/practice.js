const express = require("express");

const answerController = require("../controllers/answer");

const { authJwt, adminOnly } = require('../middlewares');

const router = express.Router();

// /practice/get-answer => GET
router.get("/get-answer", [authJwt], answerController.getAnswer);

module.exports = router;
