const express = require('express');
const router = express.Router();
const { Feedback, ShiftSchedule } = require('../models');
const { authMiddleware, requireRole } = require('../middleware/auth');

// GET /api/feedbacks - Get all feedbacks
router.get('/feedbacks', async (req, res) => {
    try {
        const feedbacks = await Feedback.find().sort({ timestamp: -1 });
        res.json(feedbacks);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/feedbacks - Submit new feedback with auto-detected shift staff
router.post('/feedbacks', async (req, res) => {
    try {
        const feedback = new Feedback(req.body);

        // Detect current shift staff
        const now = new Date();
        const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
        const dayOfWeek = days[now.getDay()];
        const hour = now.getHours();

        let shiftType = 'OFF';
        if (hour >= 7 && hour < 15) {
            shiftType = 'MORNING';
        } else if (hour >= 15 && hour < 23) {
            shiftType = 'AFTERNOON';
        } else {
            shiftType = 'EVENING';
        }

        // Find employees on shift
        const onShift = await ShiftSchedule.find({ dayOfWeek, shiftType });
        if (onShift && onShift.length > 0) {
            feedback.shiftEmployees = onShift.map(s => s.employeeName);
        }

        await feedback.save();
        res.status(201).json(feedback);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE /api/feedbacks/:id - Delete feedback (Manager only ideally, but following existing patterns)
router.delete('/feedbacks/:id', authMiddleware, async (req, res) => {
    try {
        const result = await Feedback.findByIdAndDelete(req.params.id);
        if (!result) return res.status(404).json({ message: 'Feedback not found' });
        res.json({ message: 'Feedback deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
