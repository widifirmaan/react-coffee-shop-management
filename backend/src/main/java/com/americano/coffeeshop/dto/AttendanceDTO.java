package com.americano.coffeeshop.dto;

import com.americano.coffeeshop.model.Attendance;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class AttendanceDTO {
    private String id;
    private String employeeId;
    private String employeeName;
    private LocalDate date;
    private LocalDateTime clockInTime;
    private LocalDateTime clockOutTime;
    private Double hoursWorked;
    private String status;
    private String checkInStatus;

    public static AttendanceDTO fromEntity(Attendance attendance) {
        if (attendance == null)
            return null;
        AttendanceDTO dto = new AttendanceDTO();
        dto.setId(attendance.getId());
        dto.setEmployeeId(attendance.getEmployeeId());
        dto.setEmployeeName(attendance.getEmployeeName());
        dto.setDate(attendance.getDate());
        dto.setClockInTime(attendance.getClockInTime());
        dto.setClockOutTime(attendance.getClockOutTime());
        dto.setHoursWorked(attendance.getHoursWorked());
        dto.setStatus(attendance.getStatus());
        dto.setCheckInStatus(attendance.getCheckInStatus());
        return dto;
    }
}
