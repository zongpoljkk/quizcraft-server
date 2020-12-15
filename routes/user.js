const express = require('express');

const userController = require('../controllers/user');

const router = express.Router();

router.get('/', userController.getAllUsers)
router.get('/get-user/', userController.getProfileByUID)
router.put('/edit-username', userController.editUsername)
router.post('/add-user', userController.addUser)
router.put('/used-item', userController.usedItem)

module.exports = router;