const express = require('express');
const router = express.Router();
const safeRouteController = require('../controllers/safeRouteController');

router.post('/', safeRouteController.analyzeRoute);

module.exports = router;

