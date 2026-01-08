package com.americano.coffeeshop.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Document(collection = "employees")
public class Employee {
    @Id
    private String id;
    private String employeeId;
    private String name;
    private String username;
    private String password;
    private String pin; // Added PIN
    private String role;
    private String position;
    private String email;
    private String phone;
    private Boolean active = true;
    private BigDecimal salary;
    private List<Attendance> attendanceRecord;

    @Data
    public static class Attendance {
        private LocalDate date;
        private boolean present;
        private String notes;
    }
}
