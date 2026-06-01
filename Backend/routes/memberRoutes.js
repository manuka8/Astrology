const express = require('express');
const router = express.Router();
const { getMembers, getMember, createMember, updateMember, deleteMember, uploadHoroscope } = require('../controllers/memberController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

router.use(protect);
router.get('/', getMembers);
router.post('/', upload.single('profile_photo'), createMember);
router.get('/:id', getMember);
router.put('/:id', upload.single('profile_photo'), updateMember);
router.delete('/:id', deleteMember);
router.post('/:id/upload-horoscope', upload.single('horoscope_pdf'), uploadHoroscope);

module.exports = router;
