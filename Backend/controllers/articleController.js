const db = require('../database');

const getArticles = async (req, res) => {
    try {
        const { category, published } = req.query;
        let sql = `SELECT a.*, u.name as author_name FROM articles a LEFT JOIN users u ON a.author_id=u.id WHERE 1=1`;
        const params = [];
        if (category) { sql += ' AND a.category=?'; params.push(category); }
        if (published !== undefined) { sql += ' AND a.is_published=?'; params.push(published === 'true' ? 1 : 0); }
        else if (!req.user || req.user.role !== 'admin') { sql += ' AND a.is_published=1'; }
        sql += ' ORDER BY a.created_at DESC';
        const articles = await db.allAsync(sql, params);
        res.json(articles);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};

const getArticle = async (req, res) => {
    try {
        const article = await db.getAsync(
            'SELECT a.*, u.name as author_name FROM articles a LEFT JOIN users u ON a.author_id=u.id WHERE a.id=?',
            [req.params.id]
        );
        if (!article) return res.status(404).json({ message: 'Article not found' });
        res.json(article);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};

const createArticle = async (req, res) => {
    try {
        const { title, content, excerpt, category, is_published } = req.body;
        if (!title || !content) return res.status(400).json({ message: 'title and content required' });
        const cover_image = req.file ? `/uploads/articles/${req.file.filename}` : null;
        const result = await db.runAsync(
            `INSERT INTO articles (title,content,excerpt,category,author_id,cover_image,is_published) VALUES (?,?,?,?,?,?,?)`,
            [title, content, excerpt || null, category || null, req.user.id, cover_image, is_published ? 1 : 0]
        );
        const article = await db.getAsync('SELECT * FROM articles WHERE id=?', [result.lastID]);
        res.status(201).json(article);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};

const updateArticle = async (req, res) => {
    try {
        const { title, content, excerpt, category, is_published } = req.body;
        const cover_image = req.file ? `/uploads/articles/${req.file.filename}` : undefined;
        const sets = [];
        const vals = [];
        if (title) { sets.push('title=?'); vals.push(title); }
        if (content) { sets.push('content=?'); vals.push(content); }
        if (excerpt !== undefined) { sets.push('excerpt=?'); vals.push(excerpt); }
        if (category !== undefined) { sets.push('category=?'); vals.push(category); }
        if (is_published !== undefined) { sets.push('is_published=?'); vals.push(is_published ? 1 : 0); }
        if (cover_image) { sets.push('cover_image=?'); vals.push(cover_image); }
        sets.push("updated_at=datetime('now')");
        vals.push(req.params.id);
        await db.runAsync(`UPDATE articles SET ${sets.join(',')} WHERE id=?`, vals);
        const article = await db.getAsync('SELECT * FROM articles WHERE id=?', [req.params.id]);
        res.json(article);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};

const deleteArticle = async (req, res) => {
    try {
        await db.runAsync('DELETE FROM articles WHERE id=?', [req.params.id]);
        res.json({ message: 'Article deleted' });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};

module.exports = { getArticles, getArticle, createArticle, updateArticle, deleteArticle };
