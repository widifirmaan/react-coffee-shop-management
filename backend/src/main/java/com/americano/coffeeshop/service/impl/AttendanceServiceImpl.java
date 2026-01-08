package com.americano.coffeeshop.service.impl;

import com.americano.coffeeshop.dto.AttendanceDTO;
import com.americano.coffeeshop.model.Attendance;
import com.americano.coffeeshop.repository.AttendanceRepository;
import com.americano.coffeeshop.service.AttendanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Duration; // Import Duration
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AttendanceServiceImpl implements AttendanceService {

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Override
    public AttendanceDTO clockIn(String employeeId, String employeeName) {
        // Validation: Check if already clocked in today
        Optional<Attendance> existing = attendanceRepository.findByEmployeeIdAndDate(employeeId, LocalDate.now());
        if (existing.isPresent()) {
            return AttendanceDTO.fromEntity(existing.get()); // Return existing session
        }

        Attendance attendance = new Attendance();
        attendance.setEmployeeId(employeeId);
        attendance.setEmployeeName(employeeName);
        attendance.setDate(LocalDate.now());
        attendance.setClockInTime(LocalDateTime.now());
        return AttendanceDTO.fromEntity(attendanceRepository.save(attendance));
    }

    @Override
    public AttendanceDTO clockOut(String employeeId) {
        Attendance attendance = attendanceRepository.findByEmployeeIdAndDate(employeeId, LocalDate.now())
                .orElseThrow(() -> new RuntimeException("No clock-in record found for today"));

        attendance.setClockOutTime(LocalDateTime.now());

        // Calculate hours worked
        long minutes = Duration.between(attendance.getClockInTime(), attendance.getClockOutTime()).toMinutes();
        attendance.setHoursWorked(minutes / 60.0);

        return AttendanceDTO.fromEntity(attendanceRepository.save(attendance));
    }

    @Override
    public AttendanceDTO getTodayAttendance(String employeeId) {
        return attendanceRepository.findByEmployeeIdAndDate(employeeId, LocalDate.now())
                .map(AttendanceDTO::fromEntity)
                .orElse(null);
    }

    @Override
    public List<AttendanceDTO> getAllAttendanceToday() {
        return attendanceRepository.findByDate(LocalDate.now()).stream()
                .map(AttendanceDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public List<AttendanceDTO> getAllAttendance() {
        return attendanceRepository.findAll().stream()
                .map(AttendanceDTO::fromEntity)
                .collect(Collectors.toList());
    }
}
