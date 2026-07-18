const express = require('express');
const router = express.Router();
const multer = require('multer');
const sharp = require('sharp');
const { authMiddleware } = require('../middleware/auth');
const { Image } = require('../models');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.ico'];
    const ext = '.' + file.originalname.split('.').pop().toLowerCase();
    if (!allowed.includes(ext)) {
      return cb(new Error('Only image files are allowed'), false);
    }
    cb(null, true);
  }
});

router.post('/uploads', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Compress with sharp: resize max 1920px, quality 50%, convert to webp
    const compressed = await sharp(req.file.buffer)
      .resize(1920, 1920, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 50 })
      .toBuffer();

    // Store in MongoDB as BSON Binary (not base64)
    const image = new Image({
      data: compressed,
      mimetype: 'image/webp',
      originalName: req.file.originalname,
      size: compressed.length
    });
    await image.save();

    const newUrl = `/api/images/${image.id}`;

    // Delete old image from MongoDB if provided
    const oldFile = req.body.oldFile;
    if (oldFile && oldFile.startsWith('/api/images/')) {
      const oldId = oldFile.replace('/api/images/', '');
      try {
        await Image.findByIdAndDelete(oldId);
      } catch (_) { /* ignore if not found */ }
    }

    res.setHeader('Content-Type', 'text/plain');
    res.send(newUrl);
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ message: 'Failed to process file' });
  }
});

// Serve image binary from MongoDB
router.get('/images/:id', async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }
    res.setHeader('Content-Type', image.mimetype);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.send(image.data);
  } catch (err) {
    res.status(404).json({ message: 'Image not found' });
  }
});

module.exports = router;
