const express = require('express');

const userController = require('../controllers/user');

const router = express.Router();

router.get('/', userController.getAllUsers)
router.get('/get-user/', userController.getProfileByUID)
router.post('/add-user', userController.addUser)

module.exports = router;