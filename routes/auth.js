const express = require('express');

const authController = require('../controllers/auth');
const { verifyRegister, authJwt } = require('../middlewares');

const router = express.Router();

router.post('/register', [verifyRegister], authController.register)
router.post('/login-via-mcv', authController.loginViaMCV)
router.post('/refresh-token', authController.refreshToken)

module.exports = router;
