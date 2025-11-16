const express = require('express');
const router = express.Router();
const textController = require('../controllers/textController');

router.post('/', textController.analyzeText);

module.exports = router;

