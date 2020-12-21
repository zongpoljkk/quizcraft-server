const express = require('express');

const englishController = require('../controllers/english');

const { authJwt, adminOnly } = require('../middlewares');

const router = express.Router();

router.post('/add-english-data', englishController.addEnglishData)
//testtttttt
router.get('/test', englishController.test)

module.exports = router;

