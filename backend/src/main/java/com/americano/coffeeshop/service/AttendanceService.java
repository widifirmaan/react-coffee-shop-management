package com.americano.coffeeshop.service;

import com.americano.coffeeshop.dto.AttendanceDTO;
import java.util.List;

public interface AttendanceService {
    AttendanceDTO clockIn(String employeeId, String employeeName);

    AttendanceDTO clockOut(String employeeId);

    AttendanceDTO getTodayAttendance(String employeeId);

    List<AttendanceDTO> getAllAttendanceToday();

    List<AttendanceDTO> getAllAttendance();
}
