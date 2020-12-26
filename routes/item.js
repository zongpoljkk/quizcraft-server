const express = require("express");

const itemController = require("../controllers/item");

const router = express.Router();

router.get("/", itemController.getAllItems);
router.post("/add-item", itemController.addItem);

module.exports = router;
