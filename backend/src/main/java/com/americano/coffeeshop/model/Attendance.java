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
    private Double hoursWorked; // Added
    private String status;
    private String checkInStatus;
    private Long minutesLate;
    private String debugInfo;
}
