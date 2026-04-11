const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Employee } = require('../models');
const { authMiddleware, JWT_SECRET, requireRole } = require('../middleware/auth');

// ==========================================
// AUTHENTICATION ROUTES
// ==========================================
router.post('/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        // Allows login via username or email
        const user = await Employee.findOne({ 
            $or: [{ username: username }, { email: username }] 
        });

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        // Match password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Additional business logic: only Manager can use username. Staff must use email.
        const isManager = user.role && user.role.toUpperCase() === 'MANAGER';
        const usedEmail = username.includes('@');
        if (!isManager && !usedEmail) {
            return res.status(401).json({ message: 'Staff must use email to login.' });
        }

        const payload = {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            employeeId: user.employeeId
        };
        
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });
        
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // true on Vercel
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });

        res.json(user); // Respond with user object mapping to frontend
    } catch (error) {
        console.error("Login error: ", error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/auth/logout', (req, res) => {
    res.clearCookie('token');
    res.status(200).json({ message: 'Logged out successfully' });
});

router.get('/auth/me', authMiddleware, async (req, res) => {
    try {
        const user = await Employee.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ==========================================
// EMPLOYEE ROUTES
// ==========================================
router.get('/employees', authMiddleware, async (req, res) => {
    try {
        const query = {};
        if (req.query.role) query.role = req.query.role;
        if (req.query.active !== undefined) query.active = req.query.active === 'true';
        if (req.query.search) {
            query.$or = [
                { name: new RegExp(req.query.search, 'i') },
                { employeeId: new RegExp(req.query.search, 'i') }
            ];
        }
        
        const employees = await Employee.find(query);
        res.json(employees);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/employees', authMiddleware, requireRole(['Manager', 'MANAGER']), async (req, res) => {
    try {
        // Hash password
        if (req.body.password) {
            req.body.password = await bcrypt.hash(req.body.password, 10);
        }
        const employee = new Employee(req.body);
        await employee.save();
        res.status(201).json(employee);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.put('/employees/:id', authMiddleware, requireRole(['Manager', 'MANAGER']), async (req, res) => {
    try {
        if (req.body.password) {
            req.body.password = await bcrypt.hash(req.body.password, 10);
        } else {
            delete req.body.password; // Prevent erasing if not updated
        }
        
        const updated = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.delete('/employees/:id', authMiddleware, requireRole(['Manager', 'MANAGER']), async (req, res) => {
    try {
        await Employee.findByIdAndDelete(req.params.id);
        res.json({ message: 'Employee deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.patch('/employees/:id/status', authMiddleware, requireRole(['Manager', 'MANAGER']), async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);
        if (!employee) return res.status(404).json({ message: 'Employee not found' });
        
        employee.active = !employee.active;
        await employee.save();
        res.json(employee);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
