const express = require('express');
const router = express.Router();
const { Employee } = require('../models');
const { authMiddleware } = require('../middleware/auth');

// ==========================================
// ATTENDANCE ROUTES
// ==========================================

// Get all attendance history across all employees
router.get('/attendance', authMiddleware, async (req, res) => {
    try {
        const employees = await Employee.find({}, 'name employeeId position attendanceRecord');
        // Flatten attendance records
        let allRecords = [];
        employees.forEach(emp => {
            if (emp.attendanceRecord) {
                emp.attendanceRecord.forEach(record => {
                    allRecords.push({
                        employeeId: emp.employeeId,
                        employeeName: emp.name,
                        position: emp.position,
                        ...record.toObject()
                    });
                });
            }
        });
        
        allRecords.sort((a, b) => new Date(b.date) - new Date(a.date));
        res.json(allRecords);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get attendance history for specific employee
router.get('/attendance/history/:employeeId', authMiddleware, async (req, res) => {
    try {
        const emp = await Employee.findOne({ employeeId: req.params.employeeId });
        if (!emp) return res.status(404).json({ message: 'Employee not found' });
        
        const records = emp.attendanceRecord ? 
            emp.attendanceRecord.map(rec => ({ ...rec.toObject(), employeeName: emp.name, employeeId: emp.employeeId, position: emp.position })) 
            : [];
            
        records.sort((a, b) => new Date(b.date) - new Date(a.date));
        res.json(records);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Check if clocked in today
router.get('/attendance/today/:employeeId', authMiddleware, async (req, res) => {
    try {
        const emp = await Employee.findOne({ employeeId: req.params.employeeId });
        if (!emp) return res.status(404).json({ message: 'Employee not found' });
        
        const todayStr = new Date().toISOString().split('T')[0];
        const record = emp.attendanceRecord?.find(r => r.date.toISOString().split('T')[0] === todayStr);
        
        res.json(record || null);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Clock IN
router.post('/attendance/clock-in', authMiddleware, async (req, res) => {
    try {
        const { employeeId, notes } = req.body;
        const emp = await Employee.findOne({ employeeId });
        if (!emp) return res.status(404).json({ message: 'Employee not found' });
        
        if (!emp.attendanceRecord) emp.attendanceRecord = [];
        
        const todayStr = new Date().toISOString().split('T')[0];
        const hasClockedIn = emp.attendanceRecord.some(r => r.date.toISOString().split('T')[0] === todayStr);
        
        if (hasClockedIn) {
            return res.status(400).json({ message: 'Already clocked in today' });
        }
        
        const newRecord = {
            date: new Date(),
            present: true,
            notes: notes || 'Clocked in successfully'
        };
        
        emp.attendanceRecord.push(newRecord);
        await emp.save();
        res.json(newRecord);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Clock OUT (Updates today's record notes or handles clock out logic if needed)
router.post('/attendance/clock-out', authMiddleware, async (req, res) => {
    try {
        const { employeeId } = req.body;
        const emp = await Employee.findOne({ employeeId });
        if (!emp) return res.status(404).json({ message: 'Employee not found' });
        
        const todayStr = new Date().toISOString().split('T')[0];
        const recordIndex = emp.attendanceRecord?.findIndex(r => r.date.toISOString().split('T')[0] === todayStr);
        
        if (recordIndex !== -1) {
            emp.attendanceRecord[recordIndex].notes = (emp.attendanceRecord[recordIndex].notes || '') + ' | Clocked out';
            await emp.save();
            res.json(emp.attendanceRecord[recordIndex]);
        } else {
            return res.status(400).json({ message: 'No clock in record found for today' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
