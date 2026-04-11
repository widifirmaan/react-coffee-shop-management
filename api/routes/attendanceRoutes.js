const express = require('express');
const router = express.Router();
const { Employee, ShiftSchedule } = require('../models');
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
        
        const now = new Date();
        // Convert to UTC+7 (Jakarta) for accurate daily math
        const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
        const localDate = new Date(utc + (3600000 * 7));
        const todayStr = localDate.toISOString().split('T')[0];
        
        const hasClockedIn = emp.attendanceRecord.some(r => {
            const rUtc = r.date.getTime() + (r.date.getTimezoneOffset() * 60000);
            return new Date(rUtc + 3600000 * 7).toISOString().split('T')[0] === todayStr;
        });
        
        if (hasClockedIn) {
            return res.status(400).json({ message: 'Already clocked in today' });
        }
        
        // Find shift
        const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
        const currentDay = days[localDate.getDay()];
        const shift = await ShiftSchedule.findOne({ employeeId, dayOfWeek: currentDay });
        
        let status = 'UNSCHEDULED';
        let shiftType = 'UNSCHEDULED';
        let minutesLate = 0;
        
        if (shift && shift.shiftType !== 'OFF') {
            shiftType = shift.shiftType;
            let expectedHour = 8;
            if (shiftType === 'MORNING') expectedHour = 8;
            if (shiftType === 'AFTERNOON') expectedHour = 15;
            if (shiftType === 'EVENING') expectedHour = 22;
            
            const expectedMinutes = expectedHour * 60;
            const currentMinutes = localDate.getHours() * 60 + localDate.getMinutes();
            
            if (currentMinutes > expectedMinutes + 15) {
                status = 'LATE';
                minutesLate = currentMinutes - expectedMinutes;
            } else {
                status = 'ON_TIME';
            }
        }
        
        const newRecord = {
            date: now,
            present: true,
            clockInTime: now,
            shiftType,
            status,
            minutesLate,
            notes: notes || `Clocked in (${status})`
        };
        
        emp.attendanceRecord.push(newRecord);
        await emp.save();
        res.json(newRecord);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Clock OUT
router.post('/attendance/clock-out', authMiddleware, async (req, res) => {
    try {
        const { employeeId } = req.body;
        const emp = await Employee.findOne({ employeeId });
        if (!emp) return res.status(404).json({ message: 'Employee not found' });
        
        const now = new Date();
        const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
        const localDate = new Date(utc + (3600000 * 7));
        const todayStr = localDate.toISOString().split('T')[0];
        
        const recordIndex = emp.attendanceRecord?.findIndex(r => {
            const rUtc = r.date.getTime() + (r.date.getTimezoneOffset() * 60000);
            return new Date(rUtc + 3600000 * 7).toISOString().split('T')[0] === todayStr;
        });
        
        if (recordIndex !== -1) {
            const currentRecord = emp.attendanceRecord[recordIndex];
            const workedMs = now.getTime() - new Date(currentRecord.clockInTime).getTime();
            const hoursWorked = workedMs / (1000 * 60 * 60);

            // Set clock out time and add note
            emp.attendanceRecord[recordIndex].clockOutTime = now;
            emp.attendanceRecord[recordIndex].notes = (emp.attendanceRecord[recordIndex].notes || '') + ' | Clocked out';
            await emp.save();
            
            // Check early departure
            const responseData = emp.attendanceRecord[recordIndex].toObject();
            if (hoursWorked < 7.75 && currentRecord.shiftType !== 'UNSCHEDULED') {
                responseData.status_alert = 'TOO_EARLY';
            }

            res.json(responseData);
        } else {
            return res.status(400).json({ message: 'No clock in record found for today' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
