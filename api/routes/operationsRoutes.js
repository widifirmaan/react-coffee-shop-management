const express = require('express');
const router = express.Router();
const { Order, Transaction, ShiftSchedule } = require('../models');
const { authMiddleware, requireRole } = require('../middleware/auth');

// ==========================================
// SHIFT SCHEDULE ROUTES
// ==========================================
router.get('/shifts', authMiddleware, async (req, res) => {
    try {
        res.json(await ShiftSchedule.find());
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create or Update shifts (batch)
const saveShifts = async (req, res) => {
    try {
        const shifts = req.body;
        if (!Array.isArray(shifts)) {
            return res.status(400).json({ message: "Payload must be an array of shifts" });
        }

        console.log(`[POST] /api/shifts - Saving ${shifts.length} items`);
        if (shifts.length > 0) {
            console.log("SAMPLE SHIFT:", JSON.stringify(shifts[0]));
        }
        
        // Normalize shifts to ensure only allowed fields are sent to Mongoose
        const normalizedShifts = shifts.map(s => ({
            employeeId: s.employeeId,
            employeeName: s.employeeName,
            role: s.role,
            position: s.position,
            dayOfWeek: s.dayOfWeek,
            shiftType: s.shiftType
        }));

        // Match Java logic: Delete ALL existing and save the entire new batch
        await ShiftSchedule.deleteMany({}); 
        
        if (normalizedShifts.length > 0) {
            await ShiftSchedule.insertMany(normalizedShifts);
        }
        
        res.status(200).json({ message: 'Shifts saved successfully' });
    } catch (err) {
        console.error("SHIFTS SAVE ERROR:", err);
        res.status(400).json({ message: "Save failed: " + err.message });
    }
};

router.post('/shifts', authMiddleware, saveShifts);
router.post('/shifts/batch', authMiddleware, saveShifts);

// ==========================================
// ORDER ROUTES
// ==========================================
router.get('/orders', authMiddleware, async (req, res) => {
    try {
        const query = {};
        if (req.query.status) {
            query.status = req.query.status.toUpperCase();
        }
        // Exclude specific statuses if provided (for active orders vs history)
        if (req.query.excludeStatus) {
            query.status = { $ne: req.query.excludeStatus.toUpperCase() };
        }
        const orders = await Order.find(query).sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/orders', async (req, res) => {
    try {
        const order = new Order(req.body);
        if (!order.orderNumber) {
            order.orderNumber = 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase();
        }
        // Fallback for totalPrice/grandTotal if frontend sends totalAmount
        if (!order.totalPrice && req.body.totalAmount) {
            order.totalPrice = req.body.totalAmount;
        }
        if (!order.grandTotal) {
            order.grandTotal = (order.totalPrice || 0) + (order.tax || 0);
        }
        await order.save();
        res.status(201).json(order);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.patch('/orders/:id/status', authMiddleware, async (req, res) => {
    try {
        const newStatus = req.query.status || req.body.status;
        if (!newStatus) return res.status(400).json({ message: 'Status is required' });

        const updated = await Order.findByIdAndUpdate(
            req.params.id, 
            { status: newStatus.toUpperCase() }, 
            { new: true }
        );
        res.json(updated);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.put('/orders/:id', authMiddleware, async (req, res) => {
    try {
        const { items, customerName, tableNumber, status, paymentMethod, notes } = req.body;
        const updateData = { customerName, tableNumber, status, paymentMethod, notes };
        
        if (items) {
            updateData.items = items;
            updateData.totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            // Default tax 0 if not specified, or we could fetch from existing
            const existingOrder = await Order.findById(req.params.id);
            const tax = existingOrder ? (existingOrder.tax || 0) : 0;
            updateData.tax = tax;
            updateData.grandTotal = updateData.totalPrice + tax;
        }

        const updated = await Order.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true }
        );
        if (!updated) return res.status(404).json({ message: 'Order not found' });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.delete('/orders/:id', authMiddleware, requireRole(['Manager', 'MANAGER']), async (req, res) => {
    try {
        await Order.findByIdAndDelete(req.params.id);
        res.json({ message: 'Order deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ==========================================
// TRANSACTION ROUTES
// ==========================================
router.get('/transactions', authMiddleware, async (req, res) => {
    try {
        const query = {};
        if (req.query.type) query.type = req.query.type;
        const txs = await Transaction.find(query).sort({ date: -1 });
        res.json(txs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/transactions', authMiddleware, async (req, res) => {
    try {
        const tx = new Transaction(req.body);
        await tx.save();
        res.status(201).json(tx);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
