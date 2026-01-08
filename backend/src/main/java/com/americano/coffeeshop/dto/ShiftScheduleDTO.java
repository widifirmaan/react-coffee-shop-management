package com.americano.coffeeshop.dto;

import com.americano.coffeeshop.model.ShiftSchedule;
import com.americano.coffeeshop.model.ShiftSchedule.ShiftType;
import lombok.Data;
import java.time.DayOfWeek;

@Data
public class ShiftScheduleDTO {
    private String id;
    private String employeeId;
    private String employeeName;
    private DayOfWeek dayOfWeek;
    private ShiftType shiftType;
    private String position;

    public static ShiftScheduleDTO fromEntity(ShiftSchedule shift) {
        if (shift == null)
            return null;
        ShiftScheduleDTO dto = new ShiftScheduleDTO();
        dto.setId(shift.getId());
        dto.setEmployeeId(shift.getEmployeeId());
        dto.setEmployeeName(shift.getEmployeeName());
        dto.setDayOfWeek(shift.getDayOfWeek());
        dto.setShiftType(shift.getShiftType());
        dto.setPosition(shift.getPosition());
        return dto;
    }
}
