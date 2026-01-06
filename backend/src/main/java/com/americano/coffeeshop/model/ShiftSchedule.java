package com.americano.coffeeshop.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.DayOfWeek;

@Data
@Document(collection = "shift_schedules")
public class ShiftSchedule {
    @Id
    private String id;
    private String employeeId;
    private String employeeName;
    private String position;
    private DayOfWeek dayOfWeek;
    private ShiftType shiftType;

    public enum ShiftType {
        MORNING, // 07:00 - 15:00
        AFTERNOON, // 13:00 - 21:00
        EVENING, // 17:00 - 01:00 (Overlap style to cover busy hours) OR 3 contiguous blocks
        OFF
    }
}
