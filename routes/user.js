const express = require('express');

const userController = require('../controllers/user');

const { authJwt, adminOnly } = require('../middlewares');

const router = express.Router();

router.get('/', [authJwt], userController.getAllUsers)
router.get('/get-user/', [authJwt], userController.getProfileByUID)
router.put('/edit-username', [authJwt], userController.editUsername)
router.post('/add-user', [authJwt, adminOnly], userController.addUser)
router.put('/used-item', [authJwt], userController.usedItem)

module.exports = router;