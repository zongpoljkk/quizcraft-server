const express = require("express");

const reportController = require("../controllers/report");

const { authJwt } = require("../middlewares");

const router = express.Router();

router.post("/add-report", [authJwt], reportController.addReport);

module.exports = router;
