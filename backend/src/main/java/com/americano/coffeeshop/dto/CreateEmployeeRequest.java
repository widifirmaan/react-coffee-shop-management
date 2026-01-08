package com.americano.coffeeshop.dto;

import com.americano.coffeeshop.model.Employee;
import lombok.Data;

@Data
public class CreateEmployeeRequest {
    private String id;
    private String employeeId;
    private String username;
    private String password;
    private String name;
    private String role;
    private String pin;
    private String position;
    private String email;
    private String phone;
    private java.math.BigDecimal salary;

    public Employee toEntity() {
        Employee employee = new Employee();
        // If username is missing, use employeeId
        employee.setUsername(this.username != null ? this.username : this.employeeId);
        employee.setPassword(this.password);
        employee.setName(this.name);
        employee.setRole(this.role);
        employee.setPin(this.pin);

        employee.setEmployeeId(this.employeeId);
        employee.setPosition(this.position);
        employee.setEmail(this.email);
        employee.setPhone(this.phone);
        employee.setSalary(this.salary);
        return employee;
    }
}
