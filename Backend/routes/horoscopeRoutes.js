const express = require('express');
const { createHoroscope, getHoroscopes } = require('../controllers/horoscopeController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/').post(protect, createHoroscope).get(getHoroscopes);

module.exports = router;
