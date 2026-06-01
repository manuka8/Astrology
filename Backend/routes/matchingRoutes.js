const express = require('express');
const router = express.Router();
const { getMatches, createMatch, deleteMatch } = require('../controllers/matchingController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/', getMatches);
router.post('/', createMatch);
router.delete('/:id', deleteMatch);

module.exports = router;
