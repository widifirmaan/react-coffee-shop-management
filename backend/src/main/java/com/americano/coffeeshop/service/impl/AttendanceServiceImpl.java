package com.americano.coffeeshop.service.impl;

import com.americano.coffeeshop.model.Attendance;
import com.americano.coffeeshop.repository.AttendanceRepository;
import com.americano.coffeeshop.service.AttendanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import com.americano.coffeeshop.model.ShiftSchedule;
import com.americano.coffeeshop.repository.ShiftScheduleRepository;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

@Service
public class AttendanceServiceImpl implements AttendanceService {

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private ShiftScheduleRepository shiftScheduleRepository;

    @Autowired
    private com.americano.coffeeshop.repository.EmployeeRepository employeeRepository;

    @Override
    public Attendance clockIn(String employeeId, String employeeName) {
        LocalDate today = LocalDate.now();
        Optional<Attendance> existing = attendanceRepository.findByEmployeeIdAndDate(employeeId, today);

        if (existing.isPresent()) {
            return existing.get(); // Already clocked in
        }

        Attendance attendance = new Attendance();
        attendance.setEmployeeId(employeeId);
        attendance.setEmployeeName(employeeName);
        attendance.setDate(today);
        LocalDateTime now = LocalDateTime.now();
        attendance.setClockInTime(now);
        attendance.setStatus("WORKING");

        // Check Lateness Logic
        String checkInStatus = "ON_TIME";
        long minutesLate = 0;

        // MANUAL FILTER LOGIC (FALLBACK) + DEBUG INFO
        StringBuilder sb = new StringBuilder();

        // RESOLVE ID: Backend needs EMPxxx, Frontend sends MongoID
        String targetShiftId = employeeId;
        Optional<com.americano.coffeeshop.model.Employee> empRes = employeeRepository.findById(employeeId);
        if (empRes.isPresent()) {
            targetShiftId = empRes.get().getEmployeeId(); // Switch to EMPxxx
            sb.append("DEBUG: Resolved ").append(employeeId).append(" -> ").append(targetShiftId).append(". ");
        } else {
            sb.append("DEBUG: RawID=").append(employeeId).append(". ");
        }

        sb.append("Day=").append(today.getDayOfWeek()).append(" | Now=").append(now.toLocalTime());

        // Filter using resolved targetShiftId
        final String searchId = targetShiftId;
        List<ShiftSchedule> allShifts = shiftScheduleRepository.findAll().stream()
                .filter(s -> s.getEmployeeId() != null && s.getEmployeeId().equals(searchId))
                .toList();

        sb.append(" | TotalShifts=").append(allShifts.size());

        Optional<ShiftSchedule> shiftOpt = allShifts.stream()
                .filter(s -> s.getDayOfWeek() == today.getDayOfWeek())
                .findFirst();

        if (shiftOpt.isPresent()) {
            ShiftSchedule shift = shiftOpt.get();
            sb.append(" | FoundShift=").append(shift.getShiftType());

            if (shift.getShiftType() != null && shift.getShiftType() != ShiftSchedule.ShiftType.OFF) {
                LocalTime startTime = LocalTime.of(7, 0);
                if (shift.getShiftType() == ShiftSchedule.ShiftType.AFTERNOON)
                    startTime = LocalTime.of(15, 0);
                else if (shift.getShiftType() == ShiftSchedule.ShiftType.EVENING)
                    startTime = LocalTime.of(23, 0);

                LocalDateTime expectedStart = LocalDateTime.of(today, startTime);
                long diff = ChronoUnit.MINUTES.between(expectedStart, now);

                sb.append(" | ExpStart=").append(expectedStart.toLocalTime()).append(" | Diff=").append(diff);

                if (diff > 1) {
                    checkInStatus = "LATE";
                    minutesLate = diff;
                    sb.append(" | STATUS=LATE");
                } else {
                    sb.append(" | STATUS=ON_TIME (In Grace Period or Early)");
                }
            } else {
                sb.append(" | Shift is OFF/Null");
            }
        } else {
            sb.append(" | !!! NO SHIFT FOUND FOR DAY !!!");
        }

        System.out.println(sb.toString()); // Also print to console
        attendance.setCheckInStatus(checkInStatus);
        attendance.setMinutesLate(minutesLate);
        attendance.setDebugInfo(sb.toString());

        return attendanceRepository.save(attendance);
    }

    @Override
    public Attendance clockOut(String employeeId) {
        LocalDate today = LocalDate.now();
        Optional<Attendance> existing = attendanceRepository.findByEmployeeIdAndDate(employeeId, today);

        if (existing.isPresent()) {
            Attendance attendance = existing.get();
            if (attendance.getClockOutTime() == null) {
                attendance.setClockOutTime(LocalDateTime.now());
                attendance.setStatus("COMPLETED");
                return attendanceRepository.save(attendance);
            }
            return attendance;
        }

        throw new RuntimeException("No clock-in record found for today");
    }

    @Override
    public Attendance getTodayAttendance(String employeeId) {
        return attendanceRepository.findByEmployeeIdAndDate(employeeId, LocalDate.now())
                .orElse(null);
    }

    @Override
    public List<Attendance> getAllAttendanceToday() {
        return attendanceRepository.findByDate(LocalDate.now());
    }

}
