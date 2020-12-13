const express = require("express");

const userController = require("../controllers/user");

const router = express.Router();

router.get("/", userController.getAllUsers);
router.get("/get-user/", userController.getProfileByUID);
router.get("/get-amount-of-items", userController.getAmountOfItems);
router.post("/add-user", userController.addUser);
router.put("/edit-username", userController.EditUsername);

module.exports = router;
