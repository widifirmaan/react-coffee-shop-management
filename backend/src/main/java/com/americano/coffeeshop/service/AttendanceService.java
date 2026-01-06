package com.americano.coffeeshop.service;

import com.americano.coffeeshop.model.Attendance;
import java.util.List;

public interface AttendanceService {
    Attendance clockIn(String employeeId, String employeeName);

    Attendance clockOut(String employeeId);

    Attendance getTodayAttendance(String employeeId);

    List<Attendance> getAllAttendanceToday();

    List<Attendance> getAllAttendance();
}
