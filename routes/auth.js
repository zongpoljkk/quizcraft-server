const express = require('express');

const authController = require('../controllers/auth');
const { verifyRegister, authJwt } = require('../middlewares');

const router = express.Router();

router.post('/register', [verifyRegister],authController.register)
router.post('/login',authController.login)
router.get('/mcv-callback', authController.loginViaMCV)

module.exports = router;
