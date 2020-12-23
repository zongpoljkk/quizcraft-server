const express = require('express');

const englishController = require('../controllers/english');

const { authJwt, adminOnly } = require('../middlewares');

const router = express.Router();

router.post('/add-english-data',[authJwt, adminOnly], englishController.addEnglishData)
//test
router.get('/test',[authJwt, adminOnly], englishController.test)

module.exports = router;

