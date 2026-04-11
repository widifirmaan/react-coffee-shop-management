const express = require('express');
const router = express.Router();
const { Post, Note, Notification, Feedback } = require('../models');
const { authMiddleware, requireRole } = require('../middleware/auth');

// ==========================================
// POST ROUTES (CMS)
// ==========================================
router.get('/posts', async (req, res) => {
    try {
        res.json(await Post.find().sort({ createdAt: -1 }));
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/posts/published', async (req, res) => {
    try {
        res.json(await Post.find({ status: 'PUBLISHED' }).sort({ publishedAt: -1 }));
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/posts/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });
        res.json(post);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/posts', authMiddleware, requireRole(['Manager', 'MANAGER']), async (req, res) => {
    try {
        if (!req.body.slug && req.body.title) {
            req.body.slug = req.body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();
        }
        const post = new Post(req.body);
        if (post.status === 'PUBLISHED') post.publishedAt = new Date();
        await post.save();
        res.status(201).json(post);
    } catch (err) {
        console.error("POST /posts error:", err);
        res.status(400).json({ message: err.message });
    }
});

router.put('/posts/:id', authMiddleware, requireRole(['Manager', 'MANAGER']), async (req, res) => {
    try {
        if (!req.body.slug && req.body.title) {
            req.body.slug = req.body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();
        }
        res.json(await Post.findByIdAndUpdate(req.params.id, req.body, { new: true }));
    } catch (err) {
        console.error("PUT /posts error:", err);
        res.status(400).json({ message: err.message });
    }
});

router.delete('/posts/:id', authMiddleware, requireRole(['Manager', 'MANAGER']), async (req, res) => {
    try {
        await Post.findByIdAndDelete(req.params.id);
        res.json({ message: 'Post deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ==========================================
// NOTE ROUTES
// ==========================================
router.get('/notes', authMiddleware, async (req, res) => {
    try {
        res.json(await Note.find());
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/notes/dashboard', authMiddleware, async (req, res) => {
    try {
        let note = await Note.findOne({ content: { $exists: true } }); // Simplistic: pick the first one
        if (!note) {
            note = new Note({ content: "Welcome to the Dashboard!", lastUpdatedBy: "System" });
            await note.save();
        }
        res.json(note);
    } catch (err) {
        console.error("Error fetching dashboard note:", err);
        res.status(500).json({ message: err.message });
    }
});

router.post('/notes/dashboard', authMiddleware, async (req, res) => {
    try {
        const { content } = req.body;
        let note = await Note.findOne({ content: { $exists: true } });
        if (note) {
            note.content = content;
            note.lastUpdatedBy = req.user.username;
            note.updatedAt = new Date();
            await note.save();
        } else {
            note = new Note({ content, lastUpdatedBy: req.user.username });
            await note.save();
        }
        res.json(note);
    } catch (err) {
        console.error("Error saving dashboard note:", err);
        res.status(400).json({ message: err.message });
    }
});

router.post('/notes', authMiddleware, async (req, res) => {
    try {
        const note = new Note(req.body);
        note.lastUpdatedBy = req.user.username;
        await note.save();
        res.status(201).json(note);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.put('/notes/:id', authMiddleware, async (req, res) => {
    try {
        req.body.updatedAt = new Date();
        req.body.lastUpdatedBy = req.user.username;
        res.json(await Note.findByIdAndUpdate(req.params.id, req.body, { new: true }));
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.delete('/notes/:id', authMiddleware, async (req, res) => {
    try {
        await Note.findByIdAndDelete(req.params.id);
        res.json({ message: 'Note deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ==========================================
// NOTIFICATION ROUTES
// ==========================================
router.get('/notifications', authMiddleware, async (req, res) => {
    try {
        // Match Java: findByIsReadFalseOrderByTimestampDesc
        res.json(await Notification.find({ read: false }).sort({ timestamp: -1 }).limit(50));
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/notifications', async (req, res) => {
    try {
        const notif = new Notification(req.body);
        await notif.save();
        res.status(201).json(notif);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.put('/notifications/:id/read', authMiddleware, async (req, res) => {
    try {
        res.json(await Notification.findByIdAndUpdate(req.params.id, { read: true }, { new: true }));
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// ==========================================
// FEEDBACK ROUTES
// ==========================================
router.get('/feedback', authMiddleware, async (req, res) => {
    try {
        res.json(await Feedback.find().sort({ date: -1 }));
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/feedback', async (req, res) => {
    try {
        const fb = new Feedback(req.body);
        await fb.save();
        res.status(201).json(fb);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
