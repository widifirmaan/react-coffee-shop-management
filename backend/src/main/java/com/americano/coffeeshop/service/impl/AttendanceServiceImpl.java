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
        }

        // ZOMBIE CHECK: Block if previous shift not closed
        List<Attendance> activeSessions = attendanceRepository.findByEmployeeIdAndStatus(employeeId, "WORKING");
        for (Attendance s : activeSessions) {
            if (!s.getDate().equals(today)) {
                Attendance blocked = new Attendance();
                blocked.setCheckInStatus("BLOCKED");
                blocked.setDebugInfo(
                        "LOCKED! PREVIOUS SHIFT FROM " + s.getDate() + " IS STILL ACTIVE. CONTACT MANAGER.");
                return blocked;
            }
        }

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
        // Find Active Session
        List<Attendance> activeSessions = attendanceRepository.findByEmployeeIdAndStatus(employeeId, "WORKING");
        if (activeSessions.isEmpty()) {
            // If no active session found, try finding today's completed one or return empty
            return null;
        }
        Attendance attendance = activeSessions.get(0);

        // Resolve EMP Code
        String targetShiftId = employeeId;
        Optional<com.americano.coffeeshop.model.Employee> empRes = employeeRepository.findById(employeeId);
        if (empRes.isPresent())
            targetShiftId = empRes.get().getEmployeeId();

        // Fetch Shift Logic
        final String searchId = targetShiftId;
        Optional<ShiftSchedule> shiftOpt = shiftScheduleRepository.findAll().stream()
                .filter(s -> s.getEmployeeId() != null && s.getEmployeeId().equals(searchId)
                        && s.getDayOfWeek() == attendance.getDate().getDayOfWeek())
                .findFirst();

        if (shiftOpt.isPresent()) {
            ShiftSchedule shift = shiftOpt.get();
            if (shift.getShiftType() != ShiftSchedule.ShiftType.OFF) {
                LocalTime startTime = LocalTime.of(7, 0);
                if (shift.getShiftType() == ShiftSchedule.ShiftType.AFTERNOON)
                    startTime = LocalTime.of(15, 0);
                else if (shift.getShiftType() == ShiftSchedule.ShiftType.EVENING)
                    startTime = LocalTime.of(23, 0);

                LocalDateTime shiftStart = LocalDateTime.of(attendance.getDate(), startTime);
                LocalDateTime shiftEnd = shiftStart.plusHours(8);

                // EARLY CHECK
                if (LocalDateTime.now().isBefore(shiftEnd)) {
                    Attendance reject = new Attendance();
                    reject.setCheckInStatus("TOO_EARLY");
                    long mins = ChronoUnit.MINUTES.between(LocalDateTime.now(), shiftEnd);
                    reject.setDebugInfo("SHIFT ENDS AT " + shiftEnd.toLocalTime() + ". WAIT " + mins + " MINS.");
                    return reject;
                }
            }
        }

        attendance.setClockOutTime(LocalDateTime.now());
        attendance.setStatus("COMPLETED");
        return attendanceRepository.save(attendance);
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
