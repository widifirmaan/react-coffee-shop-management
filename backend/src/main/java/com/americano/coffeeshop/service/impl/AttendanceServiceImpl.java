package com.americano.coffeeshop.service.impl;

import com.americano.coffeeshop.dto.AttendanceDTO;
import com.americano.coffeeshop.model.Attendance;
import com.americano.coffeeshop.repository.AttendanceRepository;
import com.americano.coffeeshop.repository.ShiftScheduleRepository;
import com.americano.coffeeshop.model.ShiftSchedule;
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

    @Autowired
    private ShiftScheduleRepository shiftScheduleRepository;

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
        attendance.setStatus("WORKING");

        // Check Shift Schedule for Lateness Alert
        try {
            java.time.DayOfWeek today = LocalDate.now().getDayOfWeek();
            Optional<ShiftSchedule> shiftOpt = shiftScheduleRepository.findByEmployeeIdAndDayOfWeek(employeeId, today);

            if (shiftOpt.isPresent()) {
                ShiftSchedule shift = shiftOpt.get();
                if (shift.getShiftType() != ShiftSchedule.ShiftType.OFF) {
                    java.time.LocalTime startTime;
                    switch (shift.getShiftType()) {
                        case AFTERNOON:
                            startTime = java.time.LocalTime.of(15, 0);
                            break; // 15:00
                        case EVENING:
                            startTime = java.time.LocalTime.of(23, 0);
                            break; // 23:00
                        default:
                            startTime = java.time.LocalTime.of(7, 0); // MORNING 07:00
                    }

                    java.time.LocalTime now = java.time.LocalTime.now();
                    // 15 mins grace period
                    if (now.isAfter(startTime.plusMinutes(15))) {
                        attendance.setCheckInStatus("LATE");
                    } else {
                        attendance.setCheckInStatus("ON_TIME");
                    }
                }
            } else {
                attendance.setCheckInStatus("UNSCHEDULED");
            }
        } catch (Exception e) {
            attendance.setCheckInStatus("UNKNOWN");
        }

        return AttendanceDTO.fromEntity(attendanceRepository.save(attendance));
    }

    @Override
    public AttendanceDTO clockOut(String employeeId) {
        Attendance attendance = attendanceRepository.findByEmployeeIdAndDate(employeeId, LocalDate.now())
                .orElseThrow(() -> new RuntimeException("No clock-in record found for today"));

        // Check Shift End Time to prevent early clock out
        java.time.DayOfWeek today = LocalDate.now().getDayOfWeek();
        Optional<ShiftSchedule> shiftOpt = shiftScheduleRepository.findByEmployeeIdAndDayOfWeek(employeeId, today);

        if (shiftOpt.isPresent()) {
            ShiftSchedule shift = shiftOpt.get();
            if (shift.getShiftType() != ShiftSchedule.ShiftType.OFF) {
                java.time.LocalTime endTime;
                // Assuming 8 hour shifts
                switch (shift.getShiftType()) {
                    case MORNING:
                        endTime = java.time.LocalTime.of(15, 0);
                        break; // 07:00 - 15:00
                    case AFTERNOON:
                        endTime = java.time.LocalTime.of(23, 0);
                        break; // 15:00 - 23:00
                    case EVENING:
                        endTime = java.time.LocalTime.of(7, 0);
                        break; // 23:00 - 07:00 (Next day really, but for simplicity let's handle strict hours)
                    default:
                        endTime = java.time.LocalTime.of(16, 0);
                }

                // Special handling for Evening shift crossing midnight??
                // For simplicity, let's just check current time against end time.
                // If it's evening shift, it ends at 7 AM. If current time is e.g. 5 AM, it is
                // 'before' 7 AM.
                // If it is 23:00, it is 'after' 7 AM? No.
                // Let's use LocalDateTime to be safer if needed, but LocalTime is requested.

                // Simplified Logic: Just check simple time if standard shift
                java.time.LocalTime now = java.time.LocalTime.now();

                // If EVENING shift (23-07), we only allow clockout after 07:00 AND before say
                // 12:00?
                // Or if date changed etc. This can be complex.
                // Strict user request: "tidak bisa clock out sebelum waktu shift habis"

                boolean canClockOut = true;
                if (shift.getShiftType() == ShiftSchedule.ShiftType.EVENING) {
                    // Evening shift usually ends next day morning.
                    // If now is > 23:00 (started) OR < 07:00 (not ended yet)
                    if (now.isBefore(java.time.LocalTime.of(7, 0)) || now.isAfter(java.time.LocalTime.of(22, 0))) {
                        // It is during shift
                        // Actually.. if it is 06:00, it is too early.
                        if (now.isBefore(java.time.LocalTime.of(7, 0)))
                            canClockOut = false;
                        // If it is 23:30, it is too early.
                        if (now.isAfter(java.time.LocalTime.of(23, 0)))
                            canClockOut = false;
                    }
                } else {
                    if (now.isBefore(endTime)) {
                        canClockOut = false;
                    }
                }

                if (!canClockOut) {
                    attendance.setCheckInStatus("TOO_EARLY");
                    // We DO NOT save the clock out time. We just return the status so frontend can
                    // alert.
                    // But we return the attendance object. Frontend needs to handle this.
                    // We retain the object as 'still working'.
                    return AttendanceDTO.fromEntity(attendance);
                }
            }
        }

        attendance.setClockOutTime(LocalDateTime.now());
        attendance.setStatus("COMPLETED");

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

    @Override
    public List<AttendanceDTO> getCheckedInEmployees() {
        return attendanceRepository.findByDate(LocalDate.now()).stream()
                .filter(a -> a.getClockOutTime() == null)
                .map(AttendanceDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public List<AttendanceDTO> getAttendanceHistory(String employeeId) {
        return attendanceRepository.findByEmployeeIdOrderByDateDesc(employeeId).stream()
                .map(AttendanceDTO::fromEntity)
                .collect(Collectors.toList());
    }
}
