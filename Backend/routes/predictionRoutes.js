const express = require('express');
const router = express.Router();
const { getPredictions, generatePrediction, getUsage } = require('../controllers/predictionController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/', getPredictions);
router.post('/generate', generatePrediction);
router.get('/usage', getUsage);

module.exports = router;
