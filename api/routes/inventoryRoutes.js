const express = require('express');
const router = express.Router();
const { Menu, Category, Ingredient } = require('../models');
const { authMiddleware, requireRole } = require('../middleware/auth');

// ==========================================
// CATEGORY ROUTES
// ==========================================
router.get('/categories', async (req, res) => {
    try {
        const categories = await Category.find();
        res.json(categories);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/categories', authMiddleware, async (req, res) => {
    try {
        const category = new Category(req.body);
        await category.save();
        res.status(201).json(category);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.delete('/categories/:id', authMiddleware, async (req, res) => {
    try {
        await Category.findByIdAndDelete(req.params.id);
        res.json({ message: 'Category deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ==========================================
// MENU ROUTES
// ==========================================
router.get('/menus', async (req, res) => {
    try {
        const query = {};
        if (req.query.category) query.category = req.query.category;
        if (req.query.search) {
            query.name = new RegExp(req.query.search, 'i');
        }
        const menus = await Menu.find(query);
        res.json(menus);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/menus/:id', async (req, res) => {
    try {
        const menu = await Menu.findById(req.params.id);
        if (!menu) return res.status(404).json({ message: 'Menu not found' });
        res.json(menu);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/menus', authMiddleware, async (req, res) => {
    try {
        const menu = new Menu(req.body);
        await menu.save();
        res.status(201).json(menu);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.put('/menus/:id', authMiddleware, async (req, res) => {
    try {
        const updated = await Menu.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.delete('/menus/:id', authMiddleware, async (req, res) => {
    try {
        await Menu.findByIdAndDelete(req.params.id);
        res.json({ message: 'Menu deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ==========================================
// INGREDIENT ROUTES
// ==========================================
router.get('/ingredients', authMiddleware, async (req, res) => {
    try {
        res.json(await Ingredient.find());
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/ingredients', authMiddleware, async (req, res) => {
    try {
        const ing = new Ingredient(req.body);
        await ing.save();
        res.status(201).json(ing);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.put('/ingredients/:id', authMiddleware, async (req, res) => {
    try {
        res.json(await Ingredient.findByIdAndUpdate(req.params.id, req.body, { new: true }));
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.delete('/ingredients/:id', authMiddleware, async (req, res) => {
    try {
        await Ingredient.findByIdAndDelete(req.params.id);
        res.json({ message: 'Ingredient deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
