const express = require('express');
const router = express.Router();
const { ShopConfig } = require('../models');
const { authMiddleware, requireRole } = require('../middleware/auth');

// ==========================================
// SHOP CONFIG ROUTES
// ==========================================
// Allow public access to GET it
router.get('/config', async (req, res) => {
    try {
        let config = await ShopConfig.findOne();
        if (!config) {
            config = new ShopConfig({
                shopName: 'Siap Nyafe',
                websiteTitle: 'Siap Nyafe - Excellent Coffee',
                marqueeText: 'Welcome to Siap Nyafe Coffee Shop!'
            });
            await config.save();
        }
        res.json(config);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.put('/config', authMiddleware, requireRole(['Manager', 'MANAGER']), async (req, res) => {
    try {
        let config = await ShopConfig.findOne();
        if (config) {
            // Update existing
            config = await ShopConfig.findByIdAndUpdate(config._id, req.body, { new: true });
        } else {
            // Create new
            config = new ShopConfig(req.body);
            await config.save();
        }
        res.json(config);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
