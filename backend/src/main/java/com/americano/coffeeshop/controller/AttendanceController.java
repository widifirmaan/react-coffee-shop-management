package com.americano.coffeeshop.controller;

import com.americano.coffeeshop.dto.AttendanceDTO;
import com.americano.coffeeshop.service.AttendanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/attendance")
@CrossOrigin(origins = "*")
public class AttendanceController {

    @Autowired
    private AttendanceService attendanceService;

    @PostMapping("/clock-in")
    public ResponseEntity<AttendanceDTO> clockIn(@RequestBody Map<String, String> payload) {
        String employeeId = payload.get("employeeId");
        String employeeName = payload.get("employeeName");
        return ResponseEntity.ok(attendanceService.clockIn(employeeId, employeeName));
    }

    @PostMapping("/clock-out")
    public ResponseEntity<AttendanceDTO> clockOut(@RequestBody Map<String, String> payload) {
        String employeeId = payload.get("employeeId");
        return ResponseEntity.ok(attendanceService.clockOut(employeeId));
    }

    @GetMapping("/today/{employeeId}")
    public ResponseEntity<AttendanceDTO> getTodayAttendance(@PathVariable String employeeId) {
        return ResponseEntity.ok(attendanceService.getTodayAttendance(employeeId));
    }

    @GetMapping("/today")
    public ResponseEntity<List<AttendanceDTO>> getAllAttendanceToday() {
        return ResponseEntity.ok(attendanceService.getAllAttendanceToday());
    }

    @GetMapping
    public ResponseEntity<List<AttendanceDTO>> getAllAttendance() {
        return ResponseEntity.ok(attendanceService.getAllAttendance());
    }
}
