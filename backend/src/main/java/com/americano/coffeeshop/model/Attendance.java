package com.americano.coffeeshop.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Document(collection = "attendances")
public class Attendance {
    @Id
    private String id;
    private String employeeId;
    private String employeeName;
    private LocalDate date;
    private LocalDateTime clockInTime;
    private LocalDateTime clockOutTime;
    private String status; // 'WORKING', 'COMPLETED'
    private String checkInStatus; // 'ON_TIME', 'LATE'
    private Long minutesLate;
    private String debugInfo; // Temporary for debugging
}
