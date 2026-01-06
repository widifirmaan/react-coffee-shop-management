package com.americano.coffeeshop.controller;

import com.americano.coffeeshop.model.Attendance;
import com.americano.coffeeshop.service.AttendanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    @Autowired
    private AttendanceService attendanceService;

    @PostMapping("/clock-in")
    public ResponseEntity<Attendance> clockIn(@RequestBody Map<String, String> payload) {
        String employeeId = payload.get("employeeId");
        String employeeName = payload.get("employeeName");
        return ResponseEntity.ok(attendanceService.clockIn(employeeId, employeeName));
    }

    @PostMapping("/clock-out")
    public ResponseEntity<Attendance> clockOut(@RequestBody Map<String, String> payload) {
        String employeeId = payload.get("employeeId");
        return ResponseEntity.ok(attendanceService.clockOut(employeeId));
    }

    @GetMapping("/today/{employeeId}")
    public ResponseEntity<Attendance> getTodayAttendance(@PathVariable String employeeId) {
        return ResponseEntity.ok(attendanceService.getTodayAttendance(employeeId));
    }

    @GetMapping("/today")
    public ResponseEntity<List<Attendance>> getAllAttendanceToday() {
        return ResponseEntity.ok(attendanceService.getAllAttendanceToday());
    }
}
