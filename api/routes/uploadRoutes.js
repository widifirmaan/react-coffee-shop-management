const express = require('express');
const router = express.Router();
const multer = require('multer');
const { authMiddleware } = require('../middleware/auth');

// Using memory storage because Vercel doesn't have a persistent file system
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit max to prevent MongoDB bloat
});

// ==========================================
// UPLOAD ROUTES (Vercel Base64 Override)
// ==========================================
router.post('/uploads', authMiddleware, upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        
        // Convert the buffer to a base64 Data URI string
        const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
        
        // Spring Boot expected plain text URL, here we return the full Base64 Data URI as plain text.
        res.setHeader('Content-Type', 'text/plain');
        res.send(base64Image);
        
    } catch (err) {
        res.status(500).json({ message: 'Failed to process file' });
    }
});

module.exports = router;
