const express = require('express');
const router = express.Router();
const { getArticles, getArticle, createArticle, updateArticle, deleteArticle } = require('../controllers/articleController');
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

router.get('/', getArticles);
router.get('/:id', getArticle);
router.post('/', protect, admin, upload.single('cover_image'), createArticle);
router.put('/:id', protect, admin, upload.single('cover_image'), updateArticle);
router.delete('/:id', protect, admin, deleteArticle);

module.exports = router;
