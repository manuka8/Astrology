const express = require('express');
const router = express.Router();
const { getHoroscopes, getHoroscope, createHoroscope, updateHoroscope, deleteHoroscope } = require('../controllers/horoscopeController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

router.use(protect);
router.get('/', getHoroscopes);
router.post('/', upload.single('horoscope_pdf'), createHoroscope);
router.get('/:id', getHoroscope);
router.put('/:id', upload.single('horoscope_pdf'), updateHoroscope);
router.delete('/:id', deleteHoroscope);

module.exports = router;
